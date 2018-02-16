const Roles = Object.freeze({"GUARDIAN":"Guardian", "KNIGHT":"Knight", "MAGE":"Mage", "ROGUE":"Rogue"});
const Levels = Object.freeze({0: "Pretend", 1: "Novice", 2: "Apprentice", 3: "Master"});

class Character {
	constructor(name, role, level, isPlayer, isPlayerTeam) {
		this.name = name;
		this.role = role;
		this.level = level;
		this.isPlayer = isPlayer;
		this.isPlayerTeam = isPlayerTeam;
		this.hp = 100;
		this.defense = 0.0;
		this.isDead = false;
	}

	toString() {
		return this.name + "\t[" + Levels[this.level] + " " + this.role + "]\tHP: " + this.hp.toFixed(2) + "\tDEFENSE: " + this.defense.toFixed(2);
	}
}

//When you're too tired to care TODO FIX THIS
	const BASE_PWR = 5;
	const MIN_PWR = 0.5;
	const MAX_PWR = 1.5;

class Skill {

	constructor(name, dialog, targetAttribute, isHeal, isGroup) {
		this.name = name;
		this.dialog = dialog;
		this.targetAttribute = targetAttribute;
		this.isHeal = isHeal;
		this.isGroup = isGroup;
	}
	
	stringifyTargetList(list) {
		let str = "";
		list.forEach( (c) => {
			str += c.name + "\t";
		});
		return str.substring(0, str.length - 1).replace("\t", ", ");
	}

	cast(caster, target) {
		let dx = BASE_PWR * Math.random() * (MIN_PWR + (caster.level * 0.1)) + (MAX_PWR + (caster.level * 0.1));
		if(!this.isGroup) {
			dx *= (this.isHeal ? 1 : -1) - (this.isHeal ? target.defense : 0);
			target[this.targetAttribute] += dx;
			if( target[this.targetAttribute] < 0) target[this.targetAttribute]  = 0;
		} else target.forEach( (t) => {
			dx *= (this.isHeal ? 1 : -1) - (this.isHeal ? t.defense : 0);
			dx *= ((this.isHeal && dx < 0) || (!this.isHeal && dx > 0)) ? 0 : 1;//todo comment this shit before you forget what it does
			t[this.targetAttribute] += dx;
			if( t[this.targetAttribute] < 0) t[this.targetAttribute]  = 0;
		})
		return caster.name + " used " + this.name + " on " + (target.name || this.stringifyTargetList(target)) + "\t" + (dx >= 0 ? '+' : '') + dx.toFixed(2) + this.targetAttribute;
	}

	promptForTarget() {
		//TODO: Implement
	}
}

const Skills = Object.freeze({"Guardian": [
											new Skill('Mend', '', 'hp', true, false),
											new Skill('Blind', '', 'defense', false, false),//TODO GET GROUP SKILLS TO WORK
											new Skill('DefenseUp', '', 'defense', true, false),
											new Skill('GroupHeal', '', 'defense', true, false)
										],
								"Knight": [
											new Skill('Slash', '', 'hp', false, false),
											new Skill('Shield Bash', '', 'defense', false, false),
											new Skill('Defend', '', 'defense', false, true)
										],
								"Mage": [
											new Skill('Fireball', '', 'hp', false, false),
											new Skill('Freeze', '', 'defense', false, false),
											new Skill('WindGust', '', 'defense', false, false)
										],
								"Rogue": [
											new Skill('ShadowGuard', '', 'defense', true, false),// TODO Switch back to dodge
											new Skill('Poison', '', 'hp', false, false),
											new Skill('SmokePowder', '', 'defense', false, false)
										]});


class Battle {
	// Arrays of fighters
	constructor(team1, team2) {
		this.allies = team1;
		this.enemies = team2;
		this.players = team1.concat(team2);
	}

	round() {
		let players = this.players;
		let roundText = "";
		console.log(players);
		players.forEach( (c) => {
			if(c.isDead) {
				roundText += c.name + " is ded <br />";
				return;
			} else if(c.hp <= 0) {
				c.isDead = true;
				roundText += c.name + " is ded <br />";
				return;
			}
			let skill;
			if(c.isPlayer) {
				Skills[c.role].forEach( (s) => {
					if(s.name === Player_Selected_Skill) {
						skill = s;
					}
				});
			}
			if(!skill)
				skill = Skills[c.role][Math.floor(Math.random() * (c.level + 1))];
			// console.log(c.name + "~" + c.isPlayerTeam +"~" + (skill.power <=0) + "===" + this.allies.length);
			// console.log(JSON.stringify(skill));
			let target = skill.isGroup ? ((c.isPlayerTeam && skill.isHeal) || (!c.isPlayerTeam && !skill.isHeal) ? this.allies : this.enemies) :
							((c.isPlayerTeam && skill.isHeal) || (!c.isPlayerTeam && !skill.isHeal) ? this.allies[Math.floor(Math.random() * this.allies.length)] : 
																										this.enemies[Math.floor(Math.random() * this.enemies.length)]);
			roundText += skill.cast(c, target) + "<br />";
		});
		return roundText;
	}
}

let Player_Selected_Skill;

Passage.setSkill = (skillName) => {
	Player_Selected_Skill = skillName;
	toastr.info("You will use " + skillName + " on your next turn");
};

let Combat = (allies, enemies) => {

	let player;

	allies.forEach( (a) => {
		if(a.isPlayer) {
			player = a;
		}
	});

	let newContent = '<h5>Skills</h5><div style="display: inline-block;">';
	let skillCount = player.level + 1;

	Skills[player.role].forEach( (skill) => {// TODO Only go up to player level
		if(skillCount <= 0) {
			return;
		}
		skillCount--;
		newContent += '<button onclick="Passage.setSkill(\''+ skill.name +'\')">' + skill.name + "</button>";
	});
	newContent += "</div>"
	$("#action").html(newContent);

	let battle = new Battle(allies, enemies);

	let round = (elem, done) => {
		if(!Player_Selected_Skill) {
			toastr.error('You neglected to choose a skill! But you can not stand idle in the heat of battle, you pick one at random.');
		}
		let text = '<br />' + battle.round();
		battle.players.forEach( (p) => {
			text+="<br />" + p.toString();
		});
		elem.html(text);

		let allDead = true;

		enemies.forEach( (e) => {
			if(!e.isDead) {
				// They ain't dead yet bud
				allDead = false;
			}
		});
		if(allDead) {
			done(false);
		}

		allDead = true;

		allies.forEach( (e) => {
			if(!e.isDead) {
				// We ain't dead yet bud
				allDead = false;
			}
		});
		if(allDead) {
			done(true);// Loss
		}
	}

	return round;
};
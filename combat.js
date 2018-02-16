const Roles = Object.freeze({"HEALER":"HEALER", "KNIGHT":"KNIGHT", "MAGE":"MAGE", "ROGUE":"ROGUE"});


class Skill {
	constructor(name, attribute, power) {
		this.name = name;
		this.attribute = attribute;
		this.power = power;
	}

	do(actor, target) {
		const dhp =  Math.random(this.power / 2) + (this.power / 2);
		target[this.attribute] += dhp;
		return actor.name + " used " + this.name + " on " + target.name + "\t" + (dhp >= 0 ? '+' : '') + dhp.toFixed(2) + 'hp';
	}
}

const Skills = Object.freeze({"HEALER": [new Skill('Mend', 'hp', 10)],
								"KNIGHT": [new Skill('Slash', 'hp', -10)],
								"MAGE": [new Skill('Fireball', 'hp', -5)],
								"ROGUE": [new Skill('Poison', 'hp', -5)]});
class Character {
	constructor(name, role, stats, isPlayer, isPlayerTeam) {
		this.name = name;
		this.role = role;
		this.stats = stats;
		this.isPlayer = isPlayer;
		this.isPlayerTeam = isPlayerTeam;
		this.hp = 100;
	}
}


class Battle {
	// Arrays of fighters
	constructor(team1, team2) {
		this.team1 = team1;
		this.team2 = team2;
	}

	round() {
		let players = this.team1.concat(this.team2);
		let roundText = "";
		console.log(players);
		players.forEach( (c) => {
			if(c.hp <= 0) {
				c.isDead = true;
				roundText += c.name + " is ded <br />";
				return;
			}
			let skill = Skills[c.role][0];
			console.log(c.name + "~" + c.isPlayerTeam +"~" + (skill.power <=0) + "===" + this.team1.length);
			let target = (c.isPlayerTeam && skill.power <=0 ? this.team2[Math.round(Math.random(1))] : this.team1[Math.round(Math.random(1))]);
			roundText += skill.do(c, target) + "<br />";
		});
		return roundText;
	}
}

let Combat = () => {

	let player = new Character("Player", Roles.HEALER, {}, true, true);
	let ally = new Character("Ally Knight", Roles.KNIGHT, {}, false, true);
	let enemy = new Character("Enemy Rogue", Roles.ROGUE, {}, false, false);
	let enemy1 = new Character("Enemy Mage", Roles.MAGE, {}, false, false);

	let battle = new Battle([player, ally], [enemy, enemy1]);

	let round = (elem, done) => {
		let text = '<br />' + battle.round();
		text+="<br />" + JSON.stringify(player);
		text+="<br />" + JSON.stringify(ally);
		text+="<br />" + JSON.stringify(enemy);
		text+="<br />" + JSON.stringify(enemy1);
		elem.html(text);

		if(enemy1.isDead && enemy.isDead) {
			done();
		}
	}

	return round;
};
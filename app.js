const axios = require('axios');
const FormData = require('form-data');
const readline = require('readline')

// Api key mailgun 
const mailgunApiKey = '';
const mailgunDomain = ''
const emailSender = ''

// Funcion para enviar el email
async function sendEmail(to, subject, body) {
    const formData = new FormData();
    formData.append('from', emailSender);
    formData.append('to', to);
    formData.append('subject', subject);
    formData.append('html', body);
  
    try {
      const response = await axios.post(`https://api.mailgun.net/v3/${mailgunDomain}/messages`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Basic ${Buffer.from(`api:${mailgunApiKey}`).toString('base64')}`,
        },
      });
  
      console.log('Correo electrónico enviado:', response.data);
    } catch (e) {
      console.error('Error al enviar el correo electrónico:', e.response.data);
    }
}

// Api key superhero 2183127771827858
const URL = 'https://superheroapi.com/api/2183127771827858';
const team1 = []; // Team 1
const team2 = []; // Team 2
const teamsIds = [] // Alamacen de ids ya agregados
let battleHistory = [];

// Conexion a la API
async function statsData(characterId) {
    try {
        const response = await axios.get(URL + `/${characterId}`);
        // console.log("Conexion establecida")
        return response.data;
    } catch (e) {
        console.error('Error al obtener los datos')
        throw e;
    }
}

// Funcion para generar un numero aleatorio entre un rango
const randomNumber = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Funcion para calcular el hp de un personaje
const calculateHp = (strength, durability, power, as) => {
    const hp = Math.floor((strength * 0.8 + durability * 0.7 + power) / 2 * (1 + as / 10)) + 100;  // Formula para calcular hp

    return Math.floor(hp);
}

// Funcion para calcular los stats modificados
const calculateFb = (alignmentTeam, alignmentCharacter) => {
    return (alignmentTeam === alignmentCharacter) ? 1 + randomNumber(0, 9) : Math.pow((1 + randomNumber(0, 9)), -1);
}

const newStats = (base, as, fb) => {
    const parsedBase = parseInt(base, 10);

    if (isNaN(parsedBase)) {
        throw new Error('La base debe ser un número entero.');
    }

    return Math.floor(((2 * base + as) / 1.1) * fb);
}

// Mental attack
const mentalAttack = (intelligence, speed, combat, fb) => {
    const damage = (intelligence * 0.7 + speed * 0.2 + combat * 0.1) * fb;    //Formula
    return Math.floor(damage);
}

// Fast attack
const fastAttack = (speed, durability, strength, fb) => {
    const damage = (speed * 0.55 + durability * 0.25 + strength * 0.2) * fb;
    return Math.floor(damage);
}

// Strong attack
const strongAttack = (strength, power, combat, fb) => {
    const damage = (strength * 0.6 + power * 0.2 + combat * 0.2) * fb;
    return Math.floor(damage);
}

const addCharacter = async (team, anotherTeam) => {
    for (let i = 0; i < 5; i++) {

        let characterId;
        let characterStatsData;
        let newCharacter;
        
        do {
            characterId = randomNumber(1, 731); // Rangos de id de los personajes en la api
            characterStatsData = await statsData(characterId);

            // Validamos que recibimos datos numericos 
            const { strength, durability, power } = characterStatsData.powerstats;
            if (isNaN(strength) || isNaN(durability) || isNaN(power)) {
                continue;
            }

            newCharacter = {
                name: characterStatsData.name,
                id: characterId,
                alignment: characterStatsData.biography.alignment,
                hp: 0,
                intelligence: characterStatsData.powerstats.intelligence,
                strength: characterStatsData.powerstats.strength,
                speed: characterStatsData.powerstats.speed,
                durability: characterStatsData.powerstats.durability,
                power: characterStatsData.powerstats.power,
                combat: characterStatsData.powerstats.combat,
                as: randomNumber(0,10)
            };

            newCharacter.hp = calculateHp(newCharacter.strength, newCharacter.durability, newCharacter.power, newCharacter.as);
        }
        while (anotherTeam.includes(characterId) || team.some((character) => character.id == characterId) || newCharacter == undefined || newCharacter.hp == 0);  // Validamos que no exista en el otro equipo, que no se repita en el actual equipo y que no tenga 0 de hp
        
        team.push(newCharacter);
        anotherTeam.push(characterId);
    }
}

const epicFight = async (team1, team2) => {

    // Aquí se decide si el equipo es bueno o malo
    const goodCount1 = team1.reduce((count, fighter) => count + (fighter.alignment === 'good' ? 1 : 0), 0);
    const badCount1 = team1.reduce((count, fighter) => count + (fighter.alignment === 'bad' ? 1 : 0), 0);

    let alignmentTeam1 = goodCount1 > badCount1 ? 'good' : 'bad';

    const goodCount2 = team2.reduce((count, fighter) => count + (fighter.alignment === 'good' ? 1 : 0), 0);
    const badCount2 = team2.reduce((count, fighter) => count + (fighter.alignment === 'bad' ? 1 : 0), 0);

    let alignmentTeam2 = goodCount2 > badCount2 ? 'good' : 'bad';

    // Calculamos bonificación o penalización.
    team1.forEach((character) => {
        const fb = calculateFb(alignmentTeam1, character.alignment);
        character.intelligence = newStats(character.intelligence, character.as, fb);
        character.strength = newStats(character.strength, character.as, fb);
        character.speed = newStats(character.speed, character.as, fb);
        character.durability = newStats(character.durability, character.as, fb);
        character.power = newStats(character.power, character.as, fb);
        character.combat = newStats(character.combat, character.as, fb);
    });

    team2.forEach((character) => {
        const fb = calculateFb(alignmentTeam2, character.alignment);
        character.intelligence = newStats(character.intelligence, character.as, fb);
        character.strength = newStats(character.strength, character.as, fb);
        character.speed = newStats(character.speed, character.as, fb);
        character.durability = newStats(character.durability, character.as, fb);
        character.power = newStats(character.power, character.as, fb);
        character.combat = newStats(character.combat, character.as, fb);
    });

    // Comenzamos la pelea
    while (team1.length > 0 && team2.length > 0) {
        // Agregamos una regla a la batalla, se escogerá un personaje al azar de ambos equipos y compararemos la estadística de velocidad y hp, se hará un puntaje entre los 2, el que saque el puntaje más alto, empieza primero.

        let randomFighter1 = Math.floor(Math.random() * team1.length);
        let randomFighter2 = Math.floor(Math.random() * team2.length);

        let fighter1 = team1[randomFighter1];
        let fighter2 = team2[randomFighter2];

        let score1 = parseInt(fighter1.speed) + parseInt(fighter1.hp);
        let score2 = parseInt(fighter2.speed) + parseInt(fighter2.hp);

        let firstFighter;
        let secondFighter;

        if (score1 > score2) {
            firstFighter = team1[randomFighter1];
            secondFighter = team2[randomFighter2];
        } else if (score2 > score1) {
            firstFighter = team2[randomFighter2];
            secondFighter = team1[randomFighter1];
        } else {
            // En caso de empate, elige al primero aleatoriamente
            const randomIndex = Math.random() < 0.5 ? 0 : 1;
            firstFighter = [team1[randomFighter1], team2[randomFighter2]][randomIndex];
            secondFighter = [team1[randomFighter1], team2[randomFighter2]][1 - randomIndex];
        }

        while (firstFighter.hp > 0 && secondFighter.hp > 0) {
            if (firstFighter.hp > 0) {
                let combatant1 = firstFighter;
                let combatant2 = secondFighter;

                const attackType1 = ['strong', 'fast', 'mental'][randomNumber(0, 2)];
                const attackType2 = ['strong', 'fast', 'mental'][randomNumber(0, 2)];

                let damage1;
                let damage2;

                if (attackType1 == 'strong') {
                    damage1 = strongAttack(combatant1.strength, combatant1.power, combatant1.combat, calculateFb(alignmentTeam1, combatant1.alignment));
                } else if (attackType1 == 'fast') {
                    damage1 = fastAttack(combatant1.speed, combatant1.durability, combatant1.strength, calculateFb(alignmentTeam1, combatant1.alignment));
                } else {
                    damage1 = mentalAttack(combatant1.intelligence, combatant1.speed, combatant1.combat, calculateFb(alignmentTeam1, combatant1.alignment));
                }

                battleHistory.push({
                    fighter1: firstFighter.name,
                    fighter2: secondFighter.name,
                    winner: team1.length > 0 ? 'Equipo 1' : 'Equipo 2'
                });

                console.log('-----------------------------------------');
                console.log(`${combatant1.name} VS ${combatant2.name}`);
                console.log(`${combatant1.name} - HP: ${combatant1.hp}`);
                console.log(`${combatant2.name} - HP: ${combatant2.hp}`);
                console.log(`${combatant1.name} ataca con ${attackType1} y causa ${damage1} de daño.`);

                secondFighter.hp -= damage1;

                if (secondFighter.hp <= 0) {
                    console.log(`${secondFighter.name} ha sido derrotado!`);
                    team2.splice(randomFighter2, 1);

                    if (team2.length > 0) {
                        randomFighter2 = Math.floor(Math.random() * team2.length);
                        secondFighter = team2[randomFighter2];
                    }
                }
            }

            if (secondFighter.hp > 0) {
                let combatant1 = firstFighter;
                let combatant2 = secondFighter;

                const attackType1 = ['strong', 'fast', 'mental'][randomNumber(0, 2)];
                const attackType2 = ['strong', 'fast', 'mental'][randomNumber(0, 2)];

                let damage1;
                let damage2;

                if (attackType2 == 'strong') {
                    damage2 = strongAttack(combatant2.strength, combatant2.power, combatant2.combat, calculateFb(alignmentTeam2, combatant2.alignment));
                } else if (attackType2 == 'fast') {
                    damage2 = fastAttack(combatant2.speed, combatant2.durability, combatant2.strength, calculateFb(alignmentTeam2, combatant2.alignment));
                } else {
                    damage2 = mentalAttack(combatant2.intelligence, combatant2.speed, combatant2.combat, calculateFb(alignmentTeam2, combatant2.alignment));
                }

                console.log('-----------------------------------------');
                console.log(`${combatant2.name} VS ${combatant1.name}`);
                console.log(`${combatant1.name} - HP: ${combatant1.hp}`);
                console.log(`${combatant2.name} - HP: ${combatant2.hp}`);
                console.log(`${combatant2.name} ataca con ${attackType2} y causa ${damage2} de daño.`);

                firstFighter.hp -= damage2;

                if (firstFighter.hp <= 0) {
                    console.log(`${firstFighter.name} ha sido derrotado!`);
                    team1.splice(randomFighter1, 1);

                    if (team1.length > 0) {
                        randomFighter1 = Math.floor(Math.random() * team1.length);
                        firstFighter = team1[randomFighter1];
                    }
                }
            }
        }
    }

    // Determinamos el equipo ganador
    if (team1.length > 0) {
        console.log('-----------------------------------------');
        console.log('El equipo 1 ha ganado la batalla!');
        console.log('-----------------------------------------');

        battleHistory.push({
            team1: team1.map((character) => character.name),
            team2: team2.map((character) => character.name),
            winner: 'Equipo 1',
        });
    } else {
        console.log('-----------------------------------------');
        console.log('El equipo 2 ha ganado la batalla!');
        console.log('-----------------------------------------');
        battleHistory.push({
            team1: team1.map((character) => character.name),
            team2: team2.map((character) => character.name),
            winner: 'Equipo 2',
        });
    }
    return battleHistory;
};


const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

// Añadimos personajes y alistamos ambos equipos
const teamsReady = async (team1, team2) => {
    await addCharacter(team1, teamsIds);
    await addCharacter(team2, teamsIds);
    
    if (team1.length > 0 && team2.length > 0) {
        const battleHistory = await epicFight(team1, team2);

        rl.question('Ingrese la dirección de correo electrónico: ', async (emailRecipient) => {
            const emailSubject = 'Resumen de las peleas de superhéroes';
            const emailBody = `
              ${battleHistory.map((battle, index) => `
              <h3>Batalla ${index + 1}</h3>
              <p>Equipo 1: ${battle.team1 && battle.team1.length > 0 ? battle.team1.join(', ') : 'N/A'}</p>
              <p>Equipo 2: ${battle.team2 && battle.team2.length > 0 ? battle.team2.join(', ') : 'N/A'}</p>
              <p>Ganador: ${battle.winner}</p>`).join('')}
            `;
      
            if (emailRecipient) {
              await sendEmail(emailRecipient, emailSubject, emailBody);
            } else {
              console.error('Dirección de correo electrónico no válida');
            }
      
            rl.close();
        });
    }
    else {
        console.error('Hay algun equipo vacio');
    }
};

teamsReady(team1, team2);

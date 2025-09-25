// Importiere die notwendigen Bibliotheken
let messageIndex = 0;
let currentMode = 'oxygen'; // Declare currentMode to avoid implicit global
let distance;
let isNear;
let bubbles_created;
let tree;
let human;
let oxygen;
let carbon;


const BUBBLE_CONFIG = {
    O2: {
        color: '#007bff',
        text: 'O2'
    },
    CO2: {
        color: '#808080',
        text: 'CO2'
    },
    // Startpositionen um den Baum herum (X-Y-Ebene)
    START_POSITIONS: [
        '1.5 1 0',      // Rechts vom Baum
        '-1.5 1 0',     // Links vom Baum
        '0 1 1.5',      // Hinter dem Baum
        '0 1 -1.5',     // Vor dem Baum
        '1.2 1.8 1.2',  // Rechts oben hinten
        '-1.2 1.8 1.2', // Links oben hinten
        '1.2 0.3 -1.2', // Rechts unten vorne
        '-1.2 0.3 -1.2' // Links unten vorne
    ],
    // Endpositionen für O2 (weiter weg vom Baum, nach oben steigend)
    O2_END_POSITIONS: [
        '3.5 2.5 0',      // Weit rechts, höher
        '-3.5 2.5 0',     // Weit links, höher
        '0 3 3.5',        // Weit hinten, höher
        '0 3 -3.5',       // Weit vorne, höher
        '2.8 3.5 2.8',    // Rechts oben hinten, hoch
        '-2.8 3.5 2.8',   // Links oben hinten, hoch
        '2.8 2 -2.8',     // Rechts vorne, höher
        '-2.8 2 -2.8'     // Links vorne, höher
    ],
    // Endpositionen für CO2 (näher zum Baum, nach unten sinkend)
    CO2_END_POSITIONS: [
        '0.8 0.5 0',      // Nah rechts, tiefer
        '-0.8 0.5 0',     // Nah links, tiefer
        '0 0.3 0.8',      // Nah hinten, tief
        '0 0.3 -0.8',     // Nah vorne, tief
        '0.6 0.8 0.6',    // Nah rechts hinten
        '-0.6 0.8 0.6',   // Nah links hinten
        '0.6 0.2 -0.6',   // Nah rechts vorne, tief
        '-0.6 0.2 -0.6'   // Nah links vorne, tief
    ]
};

const messages = [
    `Diese ${tree} erzeugt . ${oxygen} g O2/Std.&#128167`,
    `Das reicht ${human} Menschen für 1-Stunde-Atmen aus`,
    "Mehr Bäume &#127795; = Mehr Sauerstoff für uns alle &#10084;"
];

// CO2 messages for left side (received messages)
let co2MessageIndex = 0;
const co2Messages = [
    `Diese ${tree} nimmt ${carbon} g CO2/Std. auf &#127795;`,
    "Was sollen wir denn tun, um ihm dabei zu helfen? &#128158;"
];

// CO2 action messages for right side (sent messages)
const co2ActionMessages = [
    "pro Nutzung eines Mehrwegbechers spart man ~21g CO2 &#127796;",
    "pro KM Öffi-Fahren spart man ~108g CO2 &#128154;",
    "pro KM Radfahren spart man sogar ~166g CO2 &#128652;",
];

const wood_density={
    'BUCHE':0.68,
    'EICHE':0.75,
    'KIEFER':0.52,
    'FICHTE':0.43
}

function createO2CO2(tree,height, circumstance){
    let rho = wood_density[tree];
    let dbh = circumstance / Math.PI;

    let agb = 0.0673 * ((rho * dbh * 2 * height)*0.976)
    let anual_increment = agb * 0.05
    let carbon_intake = anual_increment * 0.5;
    let co2_year = carbon_intake * 3.67;
    let o2_year = carbon_intake * 2.67;
    let active_hours = 6 * 30 * 12;

    carbon = co2_year/active_hours * 1000;
    oxygen = o2_year/active_hours * 1000;
}

async function fillMessages(){
    const url = 'https://services2.arcgis.com/jUpNdisbWqRpMo35/arcgis/rest/services/Baumkataster_Berlin/FeatureServer/0/query?where=baumid%20%3D%20\'00008100:001162fd\'&outFields=baumid,art_dtsch,gattung_deutsch,standalter,kronedurch,stammumfg,baumhoehe&outSR=4326&f=json';
    try{
        const response = await fetch(url);
        if(!response.ok){
            throw new Error(`Response status: ${response.status}`);
        }
        const result = await response.json();
        console.log(result)

        if(result.features && result.features.length >0){
            const attrs = result.features[0].attributes;

            tree = attrs.gattung_deutsch || "Eiche";
            const height = attrs.baumhoehe || 20; // in m
            const circumstance = attrs.stammumfg || 100; //in cm
            console.log(tree);
            createO2CO2(tree,height, circumstance);

            human =  oxygen / 595.8; // ungefährer Verbrauch pro Tag

            messages[0] = `Diese ${tree} erzeugt ${oxygen.toFixed(2)} g O2/Std. &#128167;`;
            messages[1] = `Das reicht ${human.toFixed(2)} Menschen für 1-Stunde-Atmen aus`;
            co2Messages[0] = `Diese ${tree} nimmt ${carbon.toFixed(2)} g CO2/Std. auf &#127795;`;
        }
    } catch(error) {
        console.error(error.message);
    }
}


function createMessageBox(text) {
    const messageContainer = document.getElementById('messageContainer');
    const messageBox = document.createElement('div');

    messageBox.style.cssText = `
            background-color: #DCF8C6;
            color: #000;
            padding: 12px 16px;
            margin-bottom: 10px;
            border-radius: 18px;
            max-width: 80%;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
            font-size: 14px;
            line-height: 1.4;
            position: relative;
            margin-left: auto;
            margin-right: 0;
            transform: translateX(100%);
            opacity: 0;
            transition: all 0.3s ease;
            pointer-events: none;
        `;

    const cleanText = text.replace(/^\s+/, '').replace(/\s+$/, '');
    messageBox.innerHTML = cleanText;
    messageContainer.appendChild(messageBox);

    // Animate in
    setTimeout(() => {
        messageBox.style.transform = 'translateX(0)';
        messageBox.style.opacity = '1';
    }, 100);

    // Auto-remove nach 2 Sekunden
    setTimeout(() => {
        messageBox.style.transform = 'translateX(100%)';
        messageBox.style.opacity = '0';

        // Entferne das Element nach der Animation
        setTimeout(() => {
            if (messageBox.parentNode) {
                messageBox.parentNode.removeChild(messageBox);
            }
        }, 300);
    }, 5000); // 2 Sekunden anzeigen
}

function createLeftMessageBox(text) {
    const messageContainer = document.getElementById('messageContainer');
    const messageBox = document.createElement('div');

    messageBox.style.cssText = `
            position: relative;
            background-color: #E5E5EA;
            color: black;
            padding: 10px 15px;
            margin: 0 0 10px 30px;
            border-radius: 18px;
            max-width: 250px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            font-size: 14px;
            line-height: 1.4;
            word-wrap: break-word;
            box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
            opacity: 0;
            transform: translateX(-100%);
            transition: all 0.3s ease;
            pointer-events: none;
            width: fit-content;
        `;

    messageBox.innerHTML = text.trim();
    messageContainer.appendChild(messageBox);

    // Animate in
    setTimeout(() => {
        messageBox.style.opacity = '1';
        messageBox.style.transform = 'translateX(0)';
    }, 100);

    // Auto-remove nach 2 Sekunden
    setTimeout(() => {
        messageBox.style.transform = 'translateX(-100%)';
        messageBox.style.opacity = '0';

        // Entferne das Element nach der Animation
        setTimeout(() => {
            if (messageBox.parentNode) {
                messageBox.parentNode.removeChild(messageBox);
            }
        }, 300);
    }, 5000); // 2 Sekunden anzeigen
}

function showNextMessage() {
    if (messageIndex < messages.length) {
        createMessageBox(messages[messageIndex]);
        messageIndex++;

        // If this was the last O2 message, switch to CO2 mode after 7 seconds
        // 7 Seconds might be to much
        if (messageIndex === messages.length) {
            setTimeout(() => {
                switchToCO2Mode();
            }, 6000);
        }
    }
}

function clearAllMessages() {
    const messageContainer = document.getElementById('messageContainer');
    while (messageContainer.firstChild) {
        messageContainer.removeChild(messageContainer.firstChild);
    }
    messageIndex = 0; // Reset O2 message counter
    co2MessageIndex = 0; // Reset CO2 message counter
}

/**
 * Creates a single, reliable, clickable bubble with movement animation.
 * @param {number} index - The index for position arrays.
 * @param {'O2' | 'CO2'} type - The type of bubble to create.
 * @param {function} onClick - The function to execute on click.
 * @param {object} [options] - Optional parameters for size.
 * @param {number} [options.radius=0.4] - The radius of the bubble.
 * @param {string} [options.textScale='2.2 2.2 2.2'] - The scale of the text.
 * @param {boolean} [options.isStatic=false] - If true, the bubble will not have movement animations.
 */
function createBubble(index, type, onClick, options = { isStatic: false }) {
    const marker = document.getElementById('hiroMarker');
    if (!marker) return;

    const config = BUBBLE_CONFIG[type];
    const startPos = BUBBLE_CONFIG.START_POSITIONS[index % BUBBLE_CONFIG.START_POSITIONS.length];
    const endPos = type === 'O2' ?
        BUBBLE_CONFIG.O2_END_POSITIONS[index % BUBBLE_CONFIG.O2_END_POSITIONS.length] :
        BUBBLE_CONFIG.CO2_END_POSITIONS[index % BUBBLE_CONFIG.CO2_END_POSITIONS.length];

    // Set default or custom sizes
    const radius = options.radius || 0.8;
    const textScale = options.textScale || '2.2 2.2 2.2';

    // 1. Create the sphere. This is the root object and the single click target.
    const sphere = document.createElement('a-sphere');
    sphere.setAttribute('position', type === 'CO2' ?
        BUBBLE_CONFIG.O2_END_POSITIONS[index % BUBBLE_CONFIG.O2_END_POSITIONS.length] :
        startPos);
    sphere.setAttribute('radius', radius);
    sphere.setAttribute('color', config.color);
    sphere.setAttribute('material', 'opacity: 0.75; transparent: true;');
    sphere.classList.add(`${type.toLowerCase()}-bubble`);
    sphere.classList.add('clickable');

    sphere.setAttribute('geometry', 'primitive: sphere; radius: 0.8; segmentsWidth: 16; segmentsHeight: 12;');

    // Configure the disappear animation (using the correct radius)
    sphere.setAttribute('animation__disappear', 'property: scale; to: 0 0 0; dur: 300; easing: easeInQuad; startEvents: disappear');

    // Add movement animation based on bubble type
    if (!options.isStatic) {
        const animationDuration = 12000 + Math.random() * 8000; // 12-20 seconds for natural movement
        if (type === 'O2') {
            // O2 bubbles: vom Baum weg nach außen und nach oben (Sauerstoffproduktion)
            sphere.setAttribute('animation__move', `
                property: position; 
                to: ${endPos}; 
                dur: ${animationDuration}; 
                loop: true; 
                dir: normal;
                easing: easeOutCubic
            `);

            // O2 bubbles werden größer beim Aufsteigen
            sphere.setAttribute('animation__grow', `
                property: scale; 
                to: 1.3 1.3 1.3; 
                dur: ${animationDuration}; 
                loop: true; 
                dir: normal;
                easing: easeOutQuad
            `);
        } else {
            // CO2 bubbles: von außen zum Baum hin und nach unten (CO2-Absorption)
            sphere.setAttribute('animation__move', `
                property: position; 
                to: ${endPos}; 
                dur: ${animationDuration}; 
                loop: true; 
                dir: normal;
                easing: easeInCubic
            `);

            // CO2 bubbles werden kleiner beim Sinken
            sphere.setAttribute('animation__shrink', `
                property: scale; 
                to: 0.65 0.65 0.65; 
                dur: ${animationDuration}; 
                loop: true; 
                dir: normal;
                easing: easeInQuad
            `);
        }

        // Langsame Kreisbewegung um den Baum herum
        const orbitDuration = 25000 + Math.random() * 10000; // 25-35 Sekunden
        const orbitDirection = Math.random() > 0.5 ? 1 : -1; // Zufällige Richtung
        sphere.setAttribute('animation__orbit', `
            property: rotation; 
            to: 0 ${360 * orbitDirection} 0; 
            dur: ${orbitDuration}; 
            loop: true; 
            easing: linear;
            delay: ${Math.random() * 5000}
        `);

        // Sanftes Auf- und Ab-Schweben
        const currentPos = sphere.getAttribute('position') || startPos;
        const posArray = (typeof currentPos === 'string' ? currentPos : startPos).split(' ');
        const bobHeight = 0.3 + Math.random() * 0.4; // 0.3-0.7 Einheiten
        const bobTarget = `${posArray[0]} ${parseFloat(posArray[1]) + bobHeight} ${posArray[2]}`;

        sphere.setAttribute('animation__bob', `
            property: position; 
            from: ${typeof currentPos === 'string' ? currentPos : startPos}; 
            to: ${bobTarget}; 
            dur: 3000 + ${Math.random() * 2000}; 
            dir: alternate; 
            loop: true; 
            easing: easeInOutSine;
            delay: ${Math.random() * 3000}
        `);

        // Subtile Opacity-Pulsation für ätherischen Effekt
        sphere.setAttribute('animation__pulse', `
            property: material.opacity; 
            to: 0.4; 
            dur: 4000; 
            dir: alternate; 
            loop: true; 
            easing: easeInOutSine;
            delay: ${Math.random() * 2000}
        `);
    }

    // 2. Create a container for the text that will face the camera.
    const textLookAt = document.createElement('a-entity');
    textLookAt.setAttribute('look-at', '[camera]');

    // 3. Create the text itself, rotated to "stand up" correctly.
    const text = document.createElement('a-text');
    text.setAttribute('value', config.text);
    text.setAttribute('align', 'center');
    text.setAttribute('rotation', '-90 0 0'); // Stand the text up
    text.setAttribute('scale', textScale);
    text.setAttribute('color', 'white');
    text.setAttribute('raycaster', 'objects:');

    // Assemble the parts
    textLookAt.appendChild(text);
    sphere.appendChild(textLookAt);

    // 4. Use 'touchstart' for the most responsive touch interaction on mobile devices.
    sphere.addEventListener('click', () => {
        sphere.removeAttribute('animation__move');
        sphere.removeAttribute('animation__grow');
        sphere.removeAttribute('animation__shrink');
        sphere.removeAttribute('animation__orbit');
        sphere.removeAttribute('animation__pulse');
        sphere.removeAttribute('animation__bob');

        // Trigger the disappear animation
        sphere.emit('disappear');
        setTimeout(() => {
            if (sphere.parentNode) {
                sphere.parentNode.removeChild(sphere);
            }
        }, 300);
        onClick();
    })
    sphere.addEventListener('touchstart', () => {
        // Stop all animations immediately to prevent interference
        sphere.removeAttribute('animation__move');
        sphere.removeAttribute('animation__grow');
        sphere.removeAttribute('animation__shrink');
        sphere.removeAttribute('animation__orbit');
        sphere.removeAttribute('animation__pulse');
        sphere.removeAttribute('animation__bob');

        // Trigger the disappear animation
        sphere.emit('disappear');
        setTimeout(() => {
            if (sphere.parentNode) {
                sphere.parentNode.removeChild(sphere);
            }
        }, 300);

        onClick();
    }, { once: false }); // Ensure the click only fires once

    marker.appendChild(sphere);
}

function create3OxygenBubbles() {
    // Create 8 O2 bubbles with staggered timing
    for (let i = 0; i < 8; i++) {
        setTimeout(() => {
            createBubble(i, 'O2', showNextMessage);
        }, i * 1000); // 1 second delay between each bubble
    }
}

function showNextCO2Message() {
    if (co2MessageIndex < co2Messages.length) {
        // First messages from left
        createLeftMessageBox(co2Messages[co2MessageIndex]);
        co2MessageIndex++;
    } else if (co2MessageIndex === co2Messages.length) {
        // Subsequent clicks: show sequence of 3 messages from right
        co2ActionMessages.forEach((msg, index) => {
            setTimeout(() => {
                createMessageBox(msg);
            }, index * 1500); // 1.5 seconds between each message
        });
        co2MessageIndex++; // Increment to prevent re-triggering
    }
}

function create3CO2Bubbles() {
    // Create 8 CO2 bubbles with staggered timing
    for (let i = 0; i < 5; i++) {
        setTimeout(() => {
            createBubble(i, 'CO2', showNextCO2Message);
        }, i * 900); // 0.9 second delay between each bubble
    }
}

function clearAllBubbles() {
    const marker = document.getElementById('hiroMarker');
    const bubbles = marker.querySelectorAll('.o2-bubble, .co2-bubble');
    bubbles.forEach(bubble => {
        if (bubble.parentNode) {
            bubble.parentNode.removeChild(bubble);
        }
    });
}

function clearAllMessages() {
    const messageContainer = document.getElementById('messageContainer');
    while (messageContainer.firstChild) {
        messageContainer.removeChild(messageContainer.firstChild);
    }
    messageIndex = 0;
    co2MessageIndex = 0;
}

function switchToCO2Mode() {
    // Clear all existing messages first
    clearAllMessages();

    // Switch to CO2 mode
    currentMode = 'co2';

    // Clear any remaining O2 bubbles and create CO2 bubbles
    clearAllBubbles();
    create3CO2Bubbles();
}

function createLargeBubbles(){
    // Define options for significantly larger bubbles
    const largeBubbleOptions = {
        radius: 1.5, // Increased from 1 to 1.5
        textScale: '4.0 4.0 4.0', // Increased from '2.5 2.5 2.5' to '4.0 4.0 4.0'
        isStatic: true // Ensure these bubbles don't have movement animations
    };
    let mode;
    if (currentMode === 'oxygen') {
        mode = 'O2';
    } else if (currentMode === 'co2') {
        mode = 'CO2';
    }
    // Create 3 large O2 bubbles
    for (let i = 0; i < 3; i++) {
        createBubble(i, mode, showNextMessage, largeBubbleOptions);
    }
}

// Warte bis die Szene fertig geladen ist
document.querySelector('a-scene').addEventListener('loaded', async () => {

    //const imgEl = document.getElementById("clickableImage");
    const marker = document.getElementById("hiroMarker");

    await fillMessages();
    // Listen for marker detection events
    if (marker) {
        // When marker is found - always start with oxygen mode
        marker.addEventListener('markerFound', () => {
            console.log('Marker detected - starting with oxygen mode');

            currentMode = 'oxygen';
            // Reset to oxygen mode

            // Clear everything and start fresh
            clearAllBubbles();
            clearAllMessages();
            if (!isNear) {
                //create3OxygenBubbles();
            }
        });

        // When marker is lost - remove all buttons and messages
        marker.addEventListener('markerLost', () => {
            console.log('Marker lost - removing all buttons and messages');
            clearAllBubbles();
            clearAllMessages();
        });
    }
});

window.addEventListener('load', async () => {
    const camera = document.querySelector('[camera]');
    const marker = document.querySelector('a-marker');
    let check;
    let lastModeChange = 0; // Zeitstempel der letzten Änderung
    const MODE_CHANGE_DELAY = 2000; // 2 Sekunden Verzögerung zwischen Änderungen

    await fillMessages();//API abgreifen

    marker.addEventListener('markerFound', () => {
        let cameraPosition = camera.object3D.position;
        let markerPosition = marker.object3D.position;
        distance = cameraPosition.distanceTo(markerPosition)

        check = setInterval(() => {
            cameraPosition = camera.object3D.position;
            markerPosition = marker.object3D.position;
            distance = cameraPosition.distanceTo(markerPosition)

            // Update distance display
            console.log(distance);
            let tel = document.getElementById("distanz");
            tel.setAttribute("value", distance.toFixed(1));

            const now = Date.now();

            // Nur ändern wenn genug Zeit vergangen ist seit der letzten Änderung
            if (now - lastModeChange < MODE_CHANGE_DELAY) {
                return;
            }

            // Mode changes mit Verzögerung
            if (distance < 20 && !isNear && !bubbles_created) {
                console.log('Wechsel in den Nah-Modus')
                isNear = true;
                lastModeChange = now;

                // Kurze Verzögerung um sicherzustellen, dass keine Click-Events verloren gehen
                setTimeout(() => {
                    clearAllBubbles();
                    clearAllMessages();
                    createLargeBubbles();
                    bubbles_created = true;
                }, 100);

            } else if (distance >= 20 && isNear && bubbles_created) {
                console.log('Wechsel in den Fern-Modus')
                isNear = false;
                lastModeChange = now;

                // Kurze Verzögerung um sicherzustellen, dass keine Click-Events verloren gehen
                setTimeout(() => {
                    bubbles_created = false;
                    clearAllBubbles();
                    clearAllMessages();
                    create3OxygenBubbles();
                }, 100);
            }
        }, 1000); // Erhöhte Interval-Zeit: 1 Sekunde statt 400ms
    });

    marker.addEventListener('markerLost', () => {
        clearInterval(check);
        lastModeChange = 0;
        bubbles_created;// Reset bei Marker-Verlust
    })
})
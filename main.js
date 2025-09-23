// Importiere die notwendigen Bibliotheken
let messageIndex = 0;
let currentMode = 'oxygen'; // Declare currentMode to avoid implicit global
let distance;

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

//TODO Texte anpassen
const messages = [
    "Diese {Eiche} erzeugt durch. {100} g O2/Std.&#128167",
    "Das reicht {3} Menschen fuer 1-Stunde-Atmen aus",
    "Mehr Baeume &#127795; = Mehr Sauerstoff fuer uns alle &#10084;"
];

// CO2 messages for left side (received messages)
let co2MessageIndex = 0;
const co2Messages = [
    "Diese {Eiche} nimmt 100 g CO2/Std. auf &#127795;",
    "Was sollen wir denn tun, um ihm dabei zu helfen? &#128158;"
];

// CO2 action messages for right side (sent messages)
const co2ActionMessages = [
    "pro Nutzung eines Mehrwegbechers spart man ~21g weniger CO2 &#127796;",
    "pro KM Öffi-Fahren spart man ~108g weniger CO2 &#128154;",
    "pro KM Radfahren spart man sogar ~166g weniger CO2 &#128652;",
];

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
            pointer-events: none; /* Allow clicks to pass through to the AR scene */
        `;

    // Clean and debug the text
    const cleanText = text.replace(/^\s+/, '').replace(/\s+$/, '');
    messageBox.innerHTML = cleanText;
    console.log('Right message text:', JSON.stringify(cleanText));
    messageContainer.appendChild(messageBox);

    // Animate in
    setTimeout(() => {
        messageBox.style.transform = 'translateX(0)';
        messageBox.style.opacity = '1';
    }, 100);

    // Messages stay permanently - no auto-remove
    // Auto remove hinzufügen
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
            transform: translateX(0);
            transition: opacity 0.3s ease;
            pointer-events: none; /* Allow clicks to pass through to the AR scene */
            width: fit-content;
        `;

    messageBox.innerHTML = text.trim();
    messageContainer.appendChild(messageBox);

    // Anixmate in
    setTimeout(() => {
        messageBox.style.opacity = '1';
    }, 100);
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
            }, 7000);
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
 * @param {function} onClick - The function to execute when the bubble is clicked.
 */
function createBubble(index, type, onClick) {
    const marker = document.getElementById('hiroMarker');
    if (!marker) return;

    const config = BUBBLE_CONFIG[type];
    const startPos = BUBBLE_CONFIG.START_POSITIONS[index % BUBBLE_CONFIG.START_POSITIONS.length];
    const endPos = type === 'O2' ?
        BUBBLE_CONFIG.O2_END_POSITIONS[index % BUBBLE_CONFIG.O2_END_POSITIONS.length] :
        BUBBLE_CONFIG.CO2_END_POSITIONS[index % BUBBLE_CONFIG.CO2_END_POSITIONS.length];

    // 1. Create the sphere. This is the root object and the single click target.
    const sphere = document.createElement('a-sphere');
    sphere.setAttribute('position', type === 'CO2' ?
        BUBBLE_CONFIG.O2_END_POSITIONS[index % BUBBLE_CONFIG.O2_END_POSITIONS.length] :
        startPos);
    sphere.setAttribute('radius', '0.4');
    sphere.setAttribute('color', config.color);
    sphere.setAttribute('material', 'opacity: 0.75; transparent: true;');
    sphere.classList.add(`${type.toLowerCase()}-bubble`);
    sphere.classList.add('clickable');

    sphere.setAttribute('geometry', 'primitive: sphere; radius: 0.4; segmentsWidth: 16; segmentsHeight: 12;');

    // Configure the disappear animation
    sphere.setAttribute('animation__disappear', 'property: scale; to: 0 0 0; dur: 300; easing: easeInQuad; startEvents: disappear');

    // Add movement animation based on bubble type
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

    // 2. Create a container for the text that will face the camera.
    const textLookAt = document.createElement('a-entity');
    textLookAt.setAttribute('look-at', '[camera]');

    // 3. Create the text itself, rotated to "stand up" correctly.
    const text = document.createElement('a-text');
    text.setAttribute('value', config.text);
    text.setAttribute('align', 'center');
    text.setAttribute('rotation', '-90 0 0');
    text.setAttribute('scale', '2.2 2.2 2.2');
    text.setAttribute('color', 'white');
    text.setAttribute('raycaster', 'objects:');

    // Assemble the parts
    textLookAt.appendChild(text);
    sphere.appendChild(textLookAt);

    // 4. Mobile-optimized event handling
    let hasClicked = false;
    let touchTimeout;

    const handleClick = (event) => {
        if (hasClicked) return;
        hasClicked = true;

        console.log(`${type} bubble clicked!`);

        if (touchTimeout) {
            clearTimeout(touchTimeout);
        }

        // Stop all animations
        sphere.removeAttribute('animation__move');
        sphere.removeAttribute('animation__grow');
        sphere.removeAttribute('animation__shrink');
        sphere.removeAttribute('animation__orbit');
        sphere.removeAttribute('animation__pulse');
        sphere.removeAttribute('animation__bob');

        sphere.setAttribute('material', `opacity: 1; transparent: true; color: ${config.color};`);

        sphere.emit('disappear');
        setTimeout(() => {
            if (sphere.parentNode) {
                sphere.parentNode.removeChild(sphere);
            }
        }, 300);

        onClick();
    };

    // Touch events for mobile (primary)
    sphere.addEventListener('touchstart', (event) => {
        event.preventDefault(); // Prevent mouse events from firing
        touchTimeout = setTimeout(() => {
            handleClick(event);
        }, 100);
    }, { passive: false });

    sphere.addEventListener('touchend', (event) => {
        event.preventDefault();
    }, { passive: false });

    // Mouse events as fallback for desktop testing
    sphere.addEventListener('click', handleClick);

    // Visual feedback on touch
    sphere.addEventListener('touchstart', () => {
        if (!hasClicked) {
            sphere.setAttribute('material', `opacity: 1; transparent: true; color: ${config.color};`);
        }
    }, { passive: true });

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
    for (let i = 0; i < 8; i++) {
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

// Warte bis die Szene fertig geladen ist
document.querySelector('a-scene').addEventListener('loaded', () => {

    //const imgEl = document.getElementById("clickableImage");
    const marker = document.getElementById("hiroMarker");

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
            create3OxygenBubbles();
        });

        // When marker is lost - remove all buttons and messages
        marker.addEventListener('markerLost', () => {
            console.log('Marker lost - removing all buttons and messages');
            clearAllBubbles();
            clearAllMessages();
        });
    }
});

window.addEventListener('load', () => {
    const camera = document.querySelector('[camera]');
    const marker = document.querySelector('a-marker');
    let check;

    marker.addEventListener('markerFound', () => {
        let cameraPosition = camera.object3D.position;
        let markerPosition = marker.object3D.position;
        distance = cameraPosition.distanceTo(markerPosition)

        check = setInterval(() => {
            cameraPosition = camera.object3D.position;
            markerPosition = marker.object3D.position;
            distance = cameraPosition.distanceTo(markerPosition)

            // do what you want with the distance:
            console.log(distance);
            //bei 20 sollen die Spheres größer werden und klickbar. Achtung Einheiten nicht Meter
            let tel= document.getElementById("distanz");
            tel.setAttribute("value", distance);
        }, 100);
    });

    marker.addEventListener('markerLost', () => {
        clearInterval(check);
    })
})
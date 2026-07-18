// ==========================================
// CONFIGURATION: Edit your quiz data here!
// ==========================================
const GAME_CONFIG = {
    title: "Match the Concepts",
    instruction: "Tap an item on the left, then tap its match on the right to pair them up.",
    data: [
        { left: "HTML", right: "Defines Structure" },
        { left: "CSS", right: "Handles Styling" },
        { left: "JavaScript", right: "Adds Interactivity" },
        { left: "SQL", right: "Manages Databases" },
        { left: "Python", right: "Data Science & AI" } // Easily add more items!
    ]
};

document.addEventListener('DOMContentLoaded', () => {
    const leftColumn = document.getElementById('left-column');
    const rightColumn = document.getElementById('right-column');
    const submitBtn = document.getElementById('submit-btn');
    const resetBtn = document.getElementById('reset-btn');
    const resultMessage = document.getElementById('result-message');
    
    // Set customized headers
    document.getElementById('game-title').innerText = GAME_CONFIG.title;
    document.getElementById('game-instruction').innerText = GAME_CONFIG.instruction;

    let selectedLeft = null;
    let selectedRight = null;
    let pairCounter = 1;
    const totalItems = GAME_CONFIG.data.length;

    // Initialize the game UI
    initGame();

    function initGame() {
        leftColumn.innerHTML = '';
        rightColumn.innerHTML = '';
        
        const leftItems = [];
        const rightItems = [];

        // Build items out from configuration array
        GAME_CONFIG.data.forEach((item, index) => {
            const id = index + 1; // Creates a distinct pairing ID tracker

            // Create Left element
            const leftEl = document.createElement('div');
            leftEl.className = 'item';
            leftEl.setAttribute('data-id', id);
            leftEl.innerText = item.left;
            leftItems.push(leftEl);

            // Create Right element
            const rightEl = document.createElement('div');
            rightEl.className = 'item';
            rightEl.setAttribute('data-match', id);
            rightEl.innerText = item.right;
            rightItems.push(rightEl);
        });

        // Shuffle the right-side elements so they don't line up perfectly
        rightItems.sort(() => Math.random() - 0.5);

        // Inject elements into their respective DOM nodes
        leftItems.forEach(el => leftColumn.appendChild(el));
        rightItems.forEach(el => rightColumn.appendChild(el));
    }

    // Left Column Event Handler
    leftColumn.addEventListener('click', (e) => {
        const target = e.target.closest('.item');
        if (!target || target.classList.contains('submitted')) return;

        if (selectedLeft === target) {
            target.classList.remove('selected');
            selectedLeft = null;
            return;
        }

        if (selectedLeft) selectedLeft.classList.remove('selected');
        selectedLeft = target;
        selectedLeft.classList.add('selected');
        
        handlePairing();
    });

    // Right Column Event Handler
    rightColumn.addEventListener('click', (e) => {
        const target = e.target.closest('.item');
        if (!target || target.classList.contains('submitted')) return;

        if (selectedRight === target) {
            target.classList.remove('selected');
            selectedRight = null;
            return;
        }

        if (selectedRight) selectedRight.classList.remove('selected');
        selectedRight = target;
        selectedRight.classList.add('selected');
        
        handlePairing();
    });

    function handlePairing() {
        if (!selectedLeft || !selectedRight) return;

        // Clear any prior mappings these elements had
        clearPreviousPairing(selectedLeft, 'left');
        clearPreviousPairing(selectedRight, 'right');

        const currentPairNum = pairCounter++;
        
        selectedLeft.setAttribute('data-pair-id', currentPairNum);
        selectedRight.setAttribute('data-pair-id', currentPairNum);

        addBadge(selectedLeft, currentPairNum);
        addBadge(selectedRight, currentPairNum);

        selectedLeft.classList.replace('selected', 'paired');
        selectedRight.classList.replace('selected', 'paired');

        selectedLeft = null;
        selectedRight = null;

        checkIfAllMapped();
    }

    function clearPreviousPairing(element, side) {
        const oldPairId = element.getAttribute('data-pair-id');
        if (!oldPairId) return;

        const selector = side === 'left' ? '#right-column .item' : '#left-column .item';
        document.querySelectorAll(selector).forEach(el => {
            if (el.getAttribute('data-pair-id') === oldPairId) {
                el.removeAttribute('data-pair-id');
                el.classList.remove('paired');
                const badge = el.querySelector('.pair-badge');
                if (badge) badge.remove();
            }
        });

        element.removeAttribute('data-pair-id');
        const badge = element.querySelector('.pair-badge');
        if (badge) badge.remove();
    }

    function addBadge(element, num) {
        const oldBadge = element.querySelector('.pair-badge');
        if (oldBadge) oldBadge.remove();

        const badge = document.createElement('span');
        badge.className = 'pair-badge';
        badge.innerText = num;
        element.appendChild(badge);
    }

    function checkIfAllMapped() {
        const pairedLefts = leftColumn.querySelectorAll('.item.paired').length;
        if (pairedLefts === totalItems) {
            submitBtn.classList.remove('hidden');
        } else {
            submitBtn.classList.add('hidden');
        }
    }

    // Process Submission & Grading
    submitBtn.addEventListener('click', () => {
        let score = 0;
        submitBtn.classList.add('hidden');

        leftColumn.querySelectorAll('.item').forEach(leftItem => {
            leftItem.classList.add('submitted');
            const leftId = leftItem.getAttribute('data-id');
            const pairId = leftItem.getAttribute('data-pair-id');

            const rightItem = rightColumn.querySelector(`[data-pair-id="${pairId}"]`);
            rightItem.classList.add('submitted');
            
            const rightMatchId = rightItem.getAttribute('data-match');

            if (leftId === rightMatchId) {
                leftItem.classList.replace('paired', 'correct');
                rightItem.classList.replace('paired', 'correct');
                score++;
            } else {
                leftItem.classList.replace('paired', 'wrong');
                rightItem.classList.replace('paired', 'wrong');
            }
        });

        resultMessage.innerText = `You scored ${score} out of ${totalItems}!`;
        resultMessage.classList.remove('hidden');
        resetBtn.classList.remove('hidden');
    });

    // Reset layout
    resetBtn.addEventListener('click', () => {
        pairCounter = 1;
        resultMessage.classList.add('hidden');
        resetBtn.classList.add('hidden');
        submitBtn.classList.add('hidden');
        
        // Re-initialize lists and shuffle the configurations cleanly again
        initGame();
    });
});
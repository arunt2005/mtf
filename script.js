document.addEventListener('DOMContentLoaded', () => {
    const leftColumn = document.getElementById('left-column');
    const rightColumn = document.getElementById('right-column');
    const submitBtn = document.getElementById('submit-btn');
    const resetBtn = document.getElementById('reset-btn');
    const resultMessage = document.getElementById('result-message');

    let selectedLeft = null;
    let selectedRight = null;
    
    // Maps item elements to their assigned pair IDs
    // Example: { 'left-1': 1, 'right-3': 1 } means they belong to pair #1
    let assignments = new Map(); 
    let pairCounter = 1;

    const totalItems = leftColumn.children.length;

    // Left Column Taps
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

    // Right Column Taps
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

        // Clear any old pairings these individual elements already had
        clearPreviousPairing(selectedLeft, 'left');
        clearPreviousPairing(selectedRight, 'right');

        // Assign them a common visual pair number
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

        // Find the match on the opposite side that shared this ID and break it
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

            // Find the right item holding the same pair ID
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

        // Show Score Results
        resultMessage.innerText = `You scored ${score} out of ${totalItems}!`;
        resultMessage.classList.remove('hidden');
        resetBtn.classList.remove('hidden');
    });

    // Reset everything
    resetBtn.addEventListener('click', () => {
        pairCounter = 1;
        resultMessage.classList.add('hidden');
        resetBtn.classList.add('hidden');
        submitBtn.classList.add('hidden');

        document.querySelectorAll('.item').forEach(item => {
            item.className = 'item';
            item.removeAttribute('data-pair-id');
            const badge = item.querySelector('.pair-badge');
            if (badge) badge.remove();
        });

        // Shuffle right side elements for freshness
        const items = Array.from(rightColumn.children);
        items.sort(() => Math.random() - 0.5);
        items.forEach(item => rightColumn.appendChild(item));
    });
});
//Entry function to start word check
function checkSpelling(word) {
    //Fetch dictionary words and load them into list "dictionary"
    fetch('dictionary.txt')
    .then(response => response.text())
    .then(text => {
        let dictionary = text.split(/\r?\n/);
        let bestWords = findBestWords(dictionary, word);
        document.getElementById("results").innerHTML = bestWords.join("<br>");
    });
}

//Check if given character is a vowel
function isVowel(character) {
    return("aeiou".includes(character.toLowerCase()))
}

//Compute the penalty for char1 vs char2
function computePenalty(char1, char2) {
    //Same letter
    if (char1.toLowerCase() === char2.toLowerCase()) {
        return 0;
    }
    //Both vowels or consonants
    else if (isVowel(char1) === isVowel(char2)) {
        return 1;
    }
    //Vowel/consonant case
    else {
        return 3
    }
}

//Compute alignment score of word1 vs word2
function alignmentScore(word1, word2) {
    const rows = word1.length + 1;
    const cols = word2.length + 1;
    const alignmentTable = Array.from({ length: cols }, () => Array(rows).fill(0));

    //Initialize top row to all gaps
    for (let i = 0; i < rows; ++i) {
        alignmentTable[0][i] = i * 2;
    }

    //Initialize left column to all gaps
    for (let i = 0; i < cols; ++i) {
        alignmentTable[i][0] = i * 2;
    }

    //Perform alignment operations
    //word1 is word along columns, word2 is word along rows
    for (let row = 1; row < cols; ++row) {
        for (let col = 1; col < rows; ++col) {
            alignmentTable[row][col] = Math.min(
                alignmentTable[row - 1][col - 1] + computePenalty(word1[col - 1], word2[row - 1]),
                2 + alignmentTable[row][col - 1],   //Gap in word1
                2 + alignmentTable[row - 1][col]    //Gap in word2
            );
        }
    }


    return alignmentTable[cols - 1][rows - 1]

}

//Sort list after inserting a new word and score
function sortList(List) {
    for (let i = 9; i > 0; --i) {
        //Perform swap if list is out of order
        if (List[1][i] < List [1][i - 1]) {
            let tempScore = List[1][i - 1];
            let tempIndex = List[0][i - 1];

            List[1][i - 1] = List[1][i];
            List[0][i - 1] = List[0][i];

            List[1][i] = tempScore;
            List[0][i] = tempIndex;
        }
    }

    return List;
}

function findBestWords(wordList, wordToCheck) {
    const rows = 2;
    const cols = 10;
    //Row 1 is word indices, row 2 is word scores
    let bestScores = [
        Array(10).fill(1000),
        Array(10).fill(1000)
    ];

    for (let index = 0; index < wordList.length; ++index) {
        //Grab a word from the dictionary and compute its score
        let currWord = wordList[index];
        let currScore = alignmentScore(currWord, wordToCheck);

        //Check score against list of best scores
        if (currScore < bestScores[1][9]) {
            bestScores[1][9] = currScore;
            bestScores[0][9] = index;
            bestScores = sortList(bestScores);
        }
    }

    let bestWords = [];

    for (let i = 0; i < 10; ++i) {
        bestWords.push(wordList[bestScores[0][i]]);
    }

    return bestWords
}

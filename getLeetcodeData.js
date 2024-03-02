const axios = require('axios');
const reader = require('xlsx');

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function request(input_username) {
    try {
        // Define the URL and JSON payload
        const url = 'https://leetcode.com/graphql';
        const jsonPayload = {
            query: 'query userProblemsSolved($username: String!) { allQuestionsCount { difficulty count } matchedUser(username: $username) { problemsSolvedBeatsStats { difficulty percentage } submitStatsGlobal { acSubmissionNum { difficulty count } } } }',
            variables: {
                username: input_username
            }
        };

        // Make the POST request using axios
        const response = await axios.post(url, jsonPayload, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });

        // Log the response data to the console
        let user = response.data.data.matchedUser.submitStatsGlobal.acSubmissionNum;
        let map = new Map();
        for (let i in user) {
            map.set(user[i].difficulty, user[i].count);
        }
        return map;
    } catch (error) {
        // Handle errors
        // console.error(error);
        return null; // Return null in case of error
    }
}

async function readExcel() {
    try {
        // Reading the Excel file 
        const file = reader.readFile('input1.xlsx');

        let data = [];

        const sheets = file.SheetNames;
        let reqSheet = reader.utils.sheet_to_json(file.Sheets[file.SheetNames[0]]);
        // go through sheet 1 only 
        const temp = reader.utils.sheet_to_json(
            file.Sheets[file.SheetNames[0]]
        );
        // get data as json array
        temp.forEach((res) => {
            data.push(res);
        });
        let ans = [];
        // Iterating over each data entry
        for (let i = 0; i < data.length; i++) {
            console.log(data[i]);
            let splits = data[i].user_name.split("/");
            let idx = splits.length - 1;
            if(splits[idx].length == 0){
                idx--;
            }
            let res = await request(splits[idx]); // Await the request function
            // Create an object to store the data
            let itr = {};
            
            // Populate the object with data from the current entry
            for(let key in data[i]){
                itr[key] = data[i][key];
            }
            
            // Print the current object
            console.log(itr);
            
            // Check if the response is not null
            if (res !== null){
                console.log(i);
                console.log(res);
                
                // Iterate over the key-value pairs of the response object
                for (let [key, value] of res) {
                    itr[key] = value; 
                }
            }
            ans.push(itr); // Add itr object to ans array 

            await sleep(500);
        }

        // Creating a new worksheet
        const ws = reader.utils.json_to_sheet(ans);

        // Creating a new workbook
        const newFile = reader.utils.book_new();

        // Adding worksheet to the new workbook
        reader.utils.book_append_sheet(newFile, ws, 'Progress');

        // Writing to a new file
        reader.writeFile(newFile, 'output3.xlsx');
    } catch (error) {
        console.error(error);
    }
}
readExcel();
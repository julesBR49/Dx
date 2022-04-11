
const getSymptomsFromBackend = async () => {
    const rest = await fetch("http://localhost:8000/symptoms");
    const data = await rest.json();
    return data;
};

const getTestResultsFromBackend = async () => {
    const rest = await fetch("http://localhost:8000/test_results");
    const data = await rest.json();
    return data;
};

const getTestsFromBackend = async () => {
    const rest = await fetch("http://localhost:8000/tests");
    const data = await rest.json();
    return data;
};

const getTestData = async () => {
    const rest = await fetch("http://localhost:8000/submit_tests");
    const data = await rest.json();
    return data;
};

const parseTestData = function(test_array, case_id){
    const parsedTests = test_array.map((el) => {
        let results = "test not recognized";
        let test_id = "";
        let result_id = "";
        if (testsDict[el] !== undefined){
            results = testsDict[el].normal_results;
            test_id = testsDict[el].id;
        }
        if (testResultsDict[test_id + case_id] !== undefined){
            result_id = test_id + case_id;
            results = testResultsDict[result_id].results;
        };
        return {
            "test": el,
            "results": results,
            "id": result_id
    };
    });
    return parsedTests;
};

const getNewCase = async () => {
    const resp = await fetch("http://localhost:8000/case");
    const caseInfo = await resp.json();
    const div = document.createElement('div');
    div.classList.add('caseContainer');
    const primSymp = caseInfo.primarySymptoms.map((obj) => symptomsDict[obj].name);
    const secSymp = caseInfo.secondarySymptoms.map((obj) => symptomsDict[obj].name);
    div.innerHTML = `
        <h3>Case</h3>
        <p>Primary symptoms: ${primSymp}</p>
        <p>Secondary symptoms: ${secSymp}</p>
        <p>what tests would you like to order? </p>
        <form id="testsInput">
            <input type="text" id="tests" name="tests" placeholder="comma separated list" class="inputField" required />
            <input type="submit" id = "submitTests" />
        </form>
    `;
    container.append(div)
    // const submitButton = document.getElementById("submitTests");
    const form  = document.getElementById('testsInput');
    form.addEventListener('submit', (event) => {
        console.log("event listener called");
        event.preventDefault();
        new FormData(form);
    });
    form.addEventListener('formdata', (event) => {
        const data = event.formData;
        const test_data = data.get("tests").split(",");
        const test_info = parseTestData(test_data, caseInfo.id);
        test_info.forEach((value) => {
                const div = document.createElement("div");
                div.classList.add("userContainer");
                if (value.results.endsWith(".png") || value.results.endsWith(".jpeg") || value.results.endsWith(".jpg")){
                    const imgPath = "images/" + value.results;
                    div.innerHTML = `
                    <h3>${value.test}</h3>
                    <p><img src=${imgPath} class="img"></p>
                `;
                }
                else {
                    div.innerHTML = `
                    <h3>${value.test}</h3>
                    <p>${value.results}</p>
                `;
                };
                container.append(div);
        });
        const div = document.createElement('div');
        div.innerHTML = `
        <p>what is your diagnosis? </p>
        <form id="diagnosisInput">
            <input type="text" id="diagnosis" name="diagnosis" placeholder="enter your top diagnosis" class="inputField" required />
            <input type="submit" id = "submitDiagnosis" />
        </form>
        `;
        container.append(div)
        const form  = document.getElementById('diagnosisInput');
        form.addEventListener('submit', (event) => {
            console.log("event listener called");
            event.preventDefault();
            new FormData(form);
        });
        form.addEventListener('formdata', async (event) => {
            const diagnosis = event.formData.get("diagnosis");
            let num = 1;
            // console.log(diagnosis)
            const div = document.createElement('div');
            if (diagnosis.toLowerCase() == caseInfo.name.toLowerCase()){
                div.innerHTML = `
                <p> Correct!!!!! </p>
                `
            }
            else {
                num = 0;
                div.innerHTML = `
                <p> Incorrect :( </p>
                <p> Diagnosis is infact ${caseInfo.name}</p>
                `
            };
            console.log(JSON.stringify({
                number: num,
                id: caseInfo.id
            }));
            const updated = await fetch("http://localhost:8000/update_difficulty", {
                method: "POST",
                headers: {"Content-type": "application/json; charset=UTF-8"},
                body: JSON.stringify({
                    number: num,
                    id: caseInfo.id
                })
            });
            container.append(div);
        });
});
};

const container = document.getElementById("container");
const openCaseButton = document.getElementById("newCaseButton");
// const addCaseContainer = document.getElementById("addCaseContainer");
// const closeCaseButton = document.getElementById("closeCaseButton");



openCaseButton.addEventListener("click", getNewCase);

  
  // Note that top-level await is only available in modern browsers
  // https://caniuse.com/mdn-javascript_operators_await_top_level
const symptomsDict = await getSymptomsFromBackend();
const testsDict = await getTestsFromBackend();
const testResultsDict = await getTestResultsFromBackend();
console.log(symptomsDict);
console.log(testsDict);
console.log(testResultsDict);
//   console.log(res);



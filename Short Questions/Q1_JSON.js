const people = `{
    "marketing": {
        "employees": ["Jim", "Helen", "Sally"]
    },

    "software": {
        "employees": ["Tyrone", "Jessica", "Samantha"]
    },

    "hr": {
        "employees": ["Cindy", "Bob", "Alice"]
    }
}`

//JSON.parse explanation
const JS_Object = JSON.parse(people);
console.log("JavaScript Object:");
console.log(JS_Object);
console.log("Marketing Employees:");
console.log(JS_Object.marketing.employees);


//JSON.stringify explanation
const JSON_String = JSON.stringify(JS_Object);
console.log("JSON String:");
console.log(JSON_String);

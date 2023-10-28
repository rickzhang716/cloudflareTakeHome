/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */
import { parse } from 'csv-parse';
import {EmployeeCSV, Organization, Department} from './interfaces'
import { EmployeeJSON, EmployeeRequest } from './interfaces'
import { CSV } from './interfaces'
import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';


export interface Env {
    ORG: KVNamespace;
}


export default {
    async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
        await env.ORG.put("testkey","hello cloudflare assignment!")
        const value = await env.ORG.get("testkey");
        const url = new URL(request.url)


        if (url.pathname === "/test") {
            const data = {hello: "testing testing..."};
            return returnJSON(data)
        } else if (url.pathname === "/organization-chart" && request.method === "GET") {
            const res = await env.ORG.get("fixed_org")
            return new Response(res,{
                headers: {
                    "content-type": "application/json;charset=UTF-8",
                },
            });
        } else if (url.pathname === "/me" && request.method === "GET"){
            const aboutMe = {
                "name": "Rick Zhang",
                "homepage": "https://zhangrick.com",
                "githubURL": "https://github.com/rickzhang716",
                "interestingFact": "I am a varsity athlete! I love playing tennis for the University of Waterloo.",
                "skills": ["QUIC", "eBPF", "Deep Learning", "Transformer Models", "NLP"]
            }
            return returnJSON(aboutMe)
        } else if (url.pathname === "/organization-chart" && request.method === "POST") {
            const req = await request.json();
            let employees = req["organizationData"].split("\n");
            let data: Array<Array<string>> = [];
            for (let i = 0; i<employees.length;i++){
                let employeeAttributes = employees[i].split(",");
                data.push(employeeAttributes);
            }
            return handleOrg(data);
        } else if (url.pathname === "/employee" && request.method === "POST") {
            const req : EmployeeRequest = await request.json();
            const fixed_org = await env.ORG.get("fixed_org")
            const org = JSON.parse(fixed_org);
            let employees: Array<EmployeeJSON> = new Array<EmployeeJSON>();

            for (let i = 0; i< org["organization"]["departments"].length;i++){
                let dept = org["organization"]["departments"][i];
                for (let j = 0; j<dept["employees"].length;j++){
                    employees.push(dept["employees"][j]);
                }
            }
            employees = filterEmployees(org,req,employees);

            // return new Response(employees.length);
            const ans = {"employees": employees};
            const res = JSON.stringify(ans);
            return new Response(res,{
                headers: {
                    "content-type": "application/json;charset=UTF-8",
                },
            });
        } else if (url.pathname === "/orgchart" && request.method === "GET"){
            // const fixedOrg = await env.ORG.get("fixed_org")
            // const org = JSON.parse(fixedOrg);
            // let employees: Array<Array<EmployeeJSON>> = new Array<Array<EmployeeJSON>>(4);
            // let managers: Array<EmployeeJSON> = new Array<EmployeeJSON>(4);
            // for (let i = 0; i< org["organization"]["departments"].length;i++){
            // 		let dept = org["organization"]["departments"][i];
            // 		for (let j = 0; j<dept["employees"].length;j++){
            // 				const employee : EmployeeJSON = dept["employees"][j];
            // 				if (employee.name != dept["managerName"]){
            // 						employees[i].push(employee);
            // 				} else {
            // 						managers.push(employee);
            // 				}
            // 		}
            // }
            ReactDOM.render(<App />, document.getElementById('root');
        )

        }
        if (value === null) {
            return new Response("Value not found", { status: 404 });
        }
        return new Response(value);
    },
};

function filterEmployees(org, req: EmployeeRequest, employees: Array<EmployeeJSON>){

    if (req.hasOwnProperty("name")){
        const filterString:string = req["name"];
        employees = employees.filter((e) => e.name.match(filterString));
    }
    if (req.hasOwnProperty("department")){
        const filterString:string = req["department"];
        employees = employees.filter((e) => e.department.match(filterString));
    }
    if (req.hasOwnProperty("minSalary")){
        const minSalary:number = req["minSalary"];
        employees = employees.filter((e) => e.salary >= minSalary);
    }
    if (req.hasOwnProperty("maxSalary")){
        const maxSalary:number = req["maxSalary"];
        employees = employees.filter((e) => e.salary <= maxSalary);
    }
    if (req.hasOwnProperty("office")){
        const filterString:string = req["office"];
        employees = employees.filter((e) => e.office.match(filterString));
    }
    if (req.hasOwnProperty("skill")){
        const filterString:string = req["skill"];
        employees = employees.filter((e) => {
            for (let i = 0; i<e.skills.length;i++){
                if (e.skills[i].match(filterString)){
                    return true;
                }
            }
            return false;
        });
    }
    return employees
}

function handleOrg(data){
    //assume something like this:
    //{ "organizationData" : "name,department,salary,office,isManager,skill1,skill2,skill3\nJohn,CDN,80,Lisbon,FALSE,Caching,C++,AI\nJill,Developer Platform,100,Austin,FALSE,Typescript,C++,GoLang"}
    let ranks: Map<string, number> = new Map<string, number>();
    let organization: Map<string, Array<Department>> = new Map<string, Array<Department>>();
    organization["departments"] = new Array<Department>();
    let managers = 0;
    let notFound = 0;
    if (data[0].length != 8){
        return new Response("unknown data format: elements not given in multiples of 8")
    }
    for (let i = 0; i < data.length;i++){
        if (i == 0 && data[i][0] == "name" && data[i][1] == "department"){
            continue;
        } else {
            const emp = data[i];
            const name: string = emp[0];
            const department: string = emp[1];
            const salary: number= parseInt(emp[2]);
            const office: string = emp[3];
            const isManager: boolean = (emp[4] == "TRUE");
            const skill1: string = emp[5];
            const skill2: string = emp[6];
            const skill3: string = emp[7];
            let employee = new EmployeeJSON(name,department,salary,office,isManager,skill1,skill2,skill3)
            if (!ranks.has(department)){
                notFound++;
                const newDept = new Department(department);
                organization["departments"].push(newDept);
                ranks.set(department, organization["departments"].length - 1);
            }
            let idx = ranks.get(department);
            if (isManager){
                managers++;
                organization["departments"][idx]["managerName"] = name;
            }
            organization["departments"][idx].employees.push(employee)

        }
    }
    let ans = {"organization": organization};
    const res = JSON.stringify(ans);
    return new Response(res,{
        headers: {
            "content-type": "application/json;charset=UTF-8",
        },
    });
}

function returnJSON(data){
    const json = JSON.stringify(data,null,2)
    return new Response(json, {
        headers: {
            "content-type": "application/json;charset=UTF-8",
        },
    });
}


export class CSV {
		"organizationData": Array<string>;
}
export class EmployeeCSV {
		name : string;
		department: string;
		salary: number;
		office: string;
		isManager: boolean;

		skill1: string;
		skill2: string;
		skill3: string;
		constructor(name: string, department: string, salary: number, office: string, isManager:boolean, skill1:string,skill2:string,skill3:string){
				this.name = name;
				this.department = department;
				this.salary = salary;
				this.office = office;
				this.isManager = isManager;
				this.skill1 = skill1;
				this.skill2 = skill2;
				this.skill3 = skill3;
		}
}
export class ORG {
		organization: Organization;
}
export class Organization {
		departments: Array<Department>;
}
export class Department {
		name : string = "";
		managerName: string = "";
		employees: Array<EmployeeJSON> = new Array<EmployeeJSON>();
		constructor(name:string){
				this.name = name;
				this.managerName = "";
				this.employees = new Array<EmployeeJSON>();
		}
}
export class EmployeeJSON {
		name : string;
		department: string;
		salary: number;
		office: string;
		isManager: boolean;
		skills: Array<string>;
		constructor(name: string, department: string, salary: number, office: string, isManager:boolean, skill1:string,skill2:string,skill3:string){
				this.name = name;
				this.department = department;
				this.salary = salary;
				this.office = office;
				this.isManager = isManager;
				this.skills = [skill1,skill2,skill3];
		}
}

export interface EmployeeRequest {
		"name" : string,
		"department": string,
		"minSalary": number,
		"maxSalary": number,
		"office": string,
		"skill": string}


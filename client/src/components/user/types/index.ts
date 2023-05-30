type Experience = {
    startData: string,
    endData: string, 
    jobTitle: string,
    company: string, 
    companyLogo: string, 
    jobDesc:string
}

export type User = {
    name: string,
    profilePicture: string,
    age: number | null,
    workExperiences: Experience | null
}


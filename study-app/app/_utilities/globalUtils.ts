import { supabase } from "@/lib/supabase";
import { useState } from "react";

//----------------------------------------------
// This file contains utility functions that are used across multiple files in the app, such as fetching sessions by user ID, joining a session, leaving a session, etc. This is to avoid code duplication and to keep our code organized.
//---------------------------------------

//-------Type Definitions--------//

export type StudySession = {
    id: string,
    creator_id: string,
    title: string,
    subject: string,
    location: string,
    date: string,
    start_time: string,
    end_time: string,
    is_announced: boolean,
    created_at: string,
    max_people?: number,
    course?: string,
    description?: string,
}

export type Commitment = {
    id: string,
    user_id: string,
    session_id: string,
    created_at: string
}

export type User = {
    id: string,
    created_at: string,
    university: string,
    first_name: string,
    last_name: string,
    major: string,
    email: string,
    classes?: string[],
    bio?: string,
}

//-------Utility Functions--------//

//An async function that takes a user id and session id string as parameters and then tries to add them to the 
//commitments table in the database. If insert is successful, returns true, else returns false
export async function JoinSession(joinerId:string, sessionId:string): Promise<boolean> {
    const { error:insertError } = await supabase.from('commitments').insert({
        user_id: joinerId,
        session_id: sessionId
    });
    
    if(insertError){
        alert('Error joining study session.');
        return false;
    }
    else{
        return true;
    }
}

//An async function that takes a commitment id as a parameter and then deletes the corresponding commitment from the database.
//Returns true if deletion is successful, else returns false.
export async function LeaveSession(commitmentId:string): Promise<boolean> {
    const {error:deleteError} = await supabase.from('commitments').delete().eq('id',commitmentId);

    if(deleteError){
        alert('Error deleting session commitment.');
        return false;
    }
    else{
        return true;
    }
}

//An async function that takes a session id and user id as parameters and then deletes the corresponding commitment from the database.
//Returns true if deletion is successful, else returns false.
export async function LeaveSessionByUserAndSessionId(userId:string, sessionId:string): Promise<boolean> {
    const {error:deleteError} = await supabase.from('commitments').delete().eq('user_id', userId).eq('session_id', sessionId);

    if(deleteError){
        alert('Error deleting session commitment.');
        return false;
    }
    else{
        return true;
    }
}

//An async function that fetches all sessions that correspond to a given user id and returns them as an array of StudySession objects. If there is an error during fetching, returns null.
export async function fetchSessionsByUserId(userId:string): Promise<StudySession[] | null> {
    var sessions: StudySession[] = [];

    // If the userId is just an empty string, we know that there is no valid user ID.
    if(userId === "") {
        console.error("No user ID provided for fetching sessions.");
        return null;
    }

    // Fetch sessions where the creator_id matches the provided userId.
    const { data, error } = await supabase.from("study_sessions").select("*").eq("creator_id", userId);
    if (error) {
        console.error("Error fetching sessions:", error);
        return null;
    } else if (data) 
    {
        sessions = [...sessions, ...data];
    }

    return sessions;
}

//An async function to retrieve the username from a given id.
export async function fetchUserNameById(userId:string): Promise<string | null>{
    var userName: string = "";

    const {data, error } = await supabase.from("profiles").select("first_name, last_name").eq("id", userId).single();
    if (error) {
        console.error("Error fetching username:", error);
        return null;
    }
    else if (data) {
        const fullName = data.first_name + " " + data.last_name;
        userName = fullName;
    }
    return userName;
}

export async function getCreatorUsername(session: StudySession): Promise<string | null> {
        const { data, error } = await supabase.from('profiles').select('first_name, last_name').eq('id', session.creator_id).single();
        if (error) {
            console.error("Error fetching creator username:", error);
            return null;
        }
        const fullName = data.first_name + " " + data.last_name;
        return fullName;
    } 

//A function to get the hardcoded list of subjects that users can choose from when creating a study session.
export function getSubjects(): string[] {
    return [
        "Artificial Intelligence",
        "Chemical Engineering",
        "Computer and Electrical Engineering",
        "Computer Science",
        "Computer Simulation and Gaming",
        "Cybersecurity",
        "Physics",
        "Mathematics",
        "Mechanical Engineering",
        "Petroleum Engineering"
    ];
}

//A funtion to get the hardcoded list of courses by subject that users can choose from when creating a study session.
export function getCoursesBySubject(): Record<string, string[]> {
    return {
        "Artificial Intelligence": [
            "CS 3083", // Fundamentals of AI Systems
            "CS 4103", // Fundamentals of Machine Learning
            "CYB 4203", // Secure and Trustworthy AI
            "CS 4253", // Artificial Intelligence
            "ECE 4413" // Neural Networks and Deep Learning
        ],
        "Chemical Engineering": [
            "CHE 1011", // Intro to ChE Profession
            "CHE 2003", // Principles of ChE
            "CHE 3063", // Equilibrium Thermodynamics
            "CHE 3084", // Mass Transfer
            "CHE 4003", // CE Engineering Lab 1
            "CHE 4013", // CE Engineering Lab 2
            "CHE 4063", // Chemical Reactor Design
            "CHE 4803", // CE Plant design
            "CHE 4103",  // Process Component Design
            "CHE 4113",  // Process Control
            "CHE 4123" // Chemical Process Health and Safety
        ],
        "Computer and Electrical Engineering": [
            "ECE 1011", // Computer Tools for ECE
            "ECE 2001", // Basic Electrical Measurments Lab
            "ECE 2003", // Electric Circuit Analysis
            "ECE 2063", // Computer Systems Organization
            "ECE 2163", // Digital Systems Principles
            "ECE 2161", // Digital Systems Lab
            "ECE 2263", // Embedded Systems in C
            "ECE 3023", // Intro to Electromagnetics
            "ECE 3033", // Electric Power Systems
            "ECE 3113", // Signals and Linear Systems
            "ECE 3143", // Electronics I
            "ECE 4103", // Electrical and Computer Engineering Design Project Part 1
            "ECE 4203", // Electrical and Computer Engineering Design Project Part 2
            "ECE 4041", // Electronics Lab
            "ECE 4043", // Electronics II
            "ECE 4053", // Classical Control Theory
            "ECE 4073", // Information and Communication Systems
            "ECE 4163"  // Computer Hardware Techniques
        ],
        "Computer Science": [
            "CS 1001", // Introduction to Computer Science
            "CS 1043", // Intro to Programming
            "CS 2001", // Ethics
            "CS 2003", // Fundamentals of Algorithms
            "CS 2033", // Computer Organization and Assembly Language
            "CS 2123", // Data Structures
            "CS 3003", // Comparative Programming Languages
            "CS 3013", // Discrete Mathematics
            "CS 3053", // Operating Systems
            "CS 3513", // Software Engineering
            "CS 4013", // Compilers
            "CS 4163",  // Database Systems
            "CS 4333", // Computer networks
            "CS 4513" // Senior Project
        ],
        "Computer Simulation and Gaming": [
            "CSG 1003", // Introduction to Game Design
            "CSG 3013", // Intro to Real-Time Engines
            "CSG 3023", // Intro to Game Programming
            "CSG 3523", // Game Systems Development
            "CSG 3813", // Environmenal Storytelling
            "CSG 4003", // Senior Project I
            "CSG 4013", // Senior Project II
            "CSG 4283", // 3D Modeling and Animation
            "CSG 4373", // 3D Visualization of Dynamic Simulations
            "CSG 4603" // Portfolio Development
        ],
        "Cybersecurity": [
            "CYB 2004", // Secure Software Development I
            "CYB 2013", // Secure Software Development II
            "CYB 3023", // Cyber and Society Seminar
            "CYB 3043", // Enterprise Networks
            "CYB 3053", // Operating Systems
            "CYB 3073", // Intro to Cybersecurity
            "CYB 3353", // System Administration
            "CYB 3363", // Cryptography
            "CYB 4003", // Cybersecurity Capstone
            "CYB 4073", // Cyber defense
            "CYB 4104", // Software and network security
            "CYB 4413"  // Web application security
        ],
        "Physics": [
            "PHYS 1002", // Welcome to Physics
            "PHYS 2053", // General Physics I
            "PHYS 2051", // General Physics I Lab
            "PHYS 2063", // General Physics II
            "PHYS 2061", // General Physics II Lab
            "PHYS 2073", // General Physics III
            "PHYS 2071", // General Physics III Lab
            "PHYS 2083", // Foundational Modern Physics
            "PHYS 2081", // Foundational Modern Physics Lab
            "PHYS 3043", // Thermodynamics and Statistical Mechanics
            "PHYS 3053", // Mathematical Physics
            "PHYS 3083", // Modern Physics
            "PHYS 3112", // Physics instrumentation lab
            "PHYS 4003", // Classical Mechanics
            "PHYS 4033",  // Quantum Mechanics I
            "PHYS 4063" // Electricity and Magnetism
        ],
        "Mathematics": [
            "MATH 2014", // Calculus I
            "MATH 2024", // Calculus II
            "MATH 2073", // Calculus III
            "MATH 3033", // Intro to Advanced Mathematics
            "MATH 3013",  // Discrete Mathematics
            "MATH 3073", // Differential Equations
            "MATH 3553", // Modern Algebra
            "MATH 4003", // Advanced Calculus I
            "MATH 4123", // Linear Algebra
            "MATH 4503", // Numerical Methods
            "STAT 4813"  // Statistical Methods

        ],
        "Mechanical Engineering": [
            "ME 1123", // Design and Manufacturing
            "ME 1212", // ME Graphics
            "ME 2023", // Intro to Dynamics
            "ME 2123", // Materials and Technology
            "ME 3033", // Properties of Materials 
            "ME 3063", // Manufacturing
            "ME 3123", // Dynamic Systems
            "ME 4053", // System Dynamics
            "ME 4123", // Thermal Sciences
            "ME 4383", // ME Design
            "ME 4293", // Project
            "ME 4383" // ME Design
        ],
        "Petroleum Engineering": [
            "PE 1001", // Intro to Petroleum Engineering
            "PE 2101", // IRock and Fluid Properties Lab
            "PE 2113", // Rock Properties
            "PE 2123", // Fluid Properties
            "PE 3023", // Reservoir Engineering I
            "PE 3041", // Drilling Engineering I Lab
            "PE 3043", // Drilling Engineering I
            "PE 3063", // Data analytics
            "PE 3073", // Production
            "PE 4043", // Drilling Engineering II
            "PE 4053", // Formulation Evaluation
            "PE 4063", // Well Construction
            "PE 4071", // Production Engineering Lab
            "PE 4113", // Reservoir Engineering II
            "PE 4513", // Integrated Resovoir Modeling
            "PE 4983"  // FCapstone
        ]
    };
}

// A function to get the hardcoded list of times the user can choose from, specifically in the format required by a dropdown component
// (with label and value properties for each time option).
export function getTimes(): { label: string; value: string }[] {
    return [
        {label: "12:00 AM", value: "0:00"},
        {label: "12:30 AM", value: "0:30"},
        {label: "1:00 AM", value: "1:00"},
        {label: "1:30 AM", value: "1:30"},
        {label: "2:00 AM", value: "2:00"},
        {label: "2:30 AM", value: "2:30"},
        {label: "3:00 AM", value: "3:00"},
        {label: "3:30 AM", value: "3:30"},
        {label: "4:00 AM", value: "4:00"},
        {label: "4:30 AM", value: "4:30"},
        {label: "5:00 AM", value: "5:00"},
        {label: "5:30 AM", value: "5:30"},
        {label: "6:00 AM", value: "6:00"},
        {label: "6:30 AM", value: "6:30"},
        {label: "7:00 AM", value: "7:00"},
        {label: "7:30 AM", value: "7:30"},
        {label: "8:00 AM", value: "8:00"},
        {label: "8:30 AM", value: "8:30"},
        {label: "9:00 AM", value: "9:00"},
        {label: "9:30 AM", value: "9:30"},
        {label: "10:00 AM", value: "10:00"},
        {label: "10:30 AM", value: "10:30"},
        {label: "11:00 AM", value: "11:00 "},
        {label: "11:30 AM", value: "11:30"},
        {label: "12:00 PM", value: "12:00"},
        {label: "12:30 PM", value: "12:30"},
        {label: "1:00 PM", value: "13:00"},
        {label: "1:30 PM", value: "13:30"},
        {label: "2:00 PM", value: "14:00"},
        {label: "2:30 PM", value: "14:30"},
        {label: "3:00 PM", value: "15:00"},
        {label: "3:30 PM", value: "15:30"},
        {label: "4:00 PM", value: "16:00"},
        {label: "4:30 PM", value: "16:30"},
        {label: "5:00 PM", value: "17:00"},
        {label: "5:30 PM", value: "17:30"},
        {label: "6:00 PM", value: "18:00"},
        {label: "6:30 PM", value: "18:30"},
        {label: "7:00 PM", value: "19:00"},
        {label: "7:30 PM", value: "19:30"},
        {label: "8:00 PM", value: "20:00"},
        {label: "8:30 PM", value: "20:30"},
        {label: "9:00 PM", value: "21:00"},
        {label: "9:30 PM", value: "21:30"},
        {label: "10:00 PM", value: "22:00"},
        {label: "10:30 PM", value: "22:30"},
        {label: "11:00 PM", value: "23:00"},
        {label: "11:30 PM", value: "23:30"}
    ]
};
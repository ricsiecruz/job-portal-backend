import * as express from "express";
import { category, position, setup, rate, role, skill, educDegree, course, university } from "../database";
 
export const adminRoute = express.Router();
adminRoute.use(express.json());

// get all categories
adminRoute.get("/", async (_req, res) => {
    try {
        const employees = await category.category?.find({}).toArray();
        res.status(200).send(employees);
    } catch (error: any) {
        res.status(500).send(error.message);
    }
 });

//  get all positions
adminRoute.get("/position", async(_req, res) => {
    try {
        const pos = await position.position.find({}).toArray();
        res.status(200).send(pos);
    } catch(err: any) {
        res.status(500).send(err.message)
    }
})

// get all setup
adminRoute.get("/setup", async (_req, res) => {
    try {
        const result = await setup.setup.find({}).toArray();
        res.status(200).send(result);
    } catch (err: any) {
        res.status(500).send(err.message)
    }
})

// get all rate
adminRoute.get("/rate", async(req, res) => {
    try {
        const result = await rate.rate.find({}).toArray();
        res.status(200).send(result);
    } catch(err: any) {
        res.status(500).send(err.message)
    }
})

// get all roles
adminRoute.get("/role", async(req, res) => {
    try {
        const result = await role.role.find({}).toArray();
        res.status(200).send(result)
    } catch(err: any) {
        res.status(500).send(err.message)
    }
})

// get all degrees
adminRoute.get("/degree", async(req, res) => {
    try {
        const result = await educDegree.degree.find({}).toArray();
        res.status(200).send(result)
    } catch(err: any) {
        res.status(500).send(err.message)
    }
})

// get all courses
adminRoute.get("/course", async(req, res) => {
    try {
        const result = await course.course.find({}).toArray();
        res.status(200).send(result)
    } catch(err: any) {
        res.status(500).send(err.message)
    }
})

// get all universities
adminRoute.get("/university", async(req, res) => {
    try {
        const result = await university.university.find({}).toArray();
        res.status(200).send(result)
    } catch(err: any) {
        res.status(500).send(err.message)
    }
})

// get all skills
adminRoute.get("/skills", async(req, res) => {
    try {
        const result = await skill.skill.aggregate([{$addFields: {id: "$_id"}}]).toArray();
        res.status(200).send(result)
    } catch(err: any) {
        res.status(500).send(err.message)
    }
})

//  add category
adminRoute.post("/category", async (req, res) => {
try {
    const employee = req.body;
    const result = await category.category.insertOne(employee);

    if (result?.acknowledged) {
        res.status(201).send(result);
    } else {
        res.status(500).send("Failed to create a new employee.");
    }
} catch (error: any) {
    console.error(error);
    res.status(400).send(error.message);
}
});

//  add position
adminRoute.post("/position", async (req, res) => {
    try {
        const pos = req.body;
        const result = await position.position.insertOne(pos);
        if(result?.acknowledged) {
            res.status(201).send(result);
        } else {
            res.status(500).send("Failed to create new position.");
        }
    } catch(err: any) {
        res.status(400).send(err.message);
    }
})

// add setup
adminRoute.post("/setup", async (req, res) => {
    try {
        const setupReq = req.body;
        const result = await setup.setup.insertOne(setupReq);
        if(result?.acknowledged) {
            res.status(201).send(result);
        } else {
            res.status(500).send("Failed to create new setup.");
        }
    } catch(err: any) {
        res.status(400).send(err.message)
    }
})

// add rate
adminRoute.post("/rate", async(req, res) => {
    try {
        const rateReq = req.body;
        const result = await rate.rate.insertOne(rateReq);
        if(result?.acknowledged) {
            res.status(201).send(result);
        } else {
            res.status(500).send("Failed to create new rate.");
        }
    } catch(err: any) {
        res.status(400).send(err.message)
    }
})

// add role
adminRoute.post("/role", async(req, res) => {
    try {
        const roleReq = req.body;
        const result = await role.role.insertOne(roleReq);
        if(result?.acknowledged) {
            res.status(201).send(result);
        } else {
            res.status(500).send("Failed to create new role.");
        }
    } catch(err: any) {
        res.status(400).send(err.message)
    }
})

// add degree
adminRoute.post("/degree", async(req, res) => {
    try {
        const degreeReq = req.body;
        const result = await educDegree.degree.insertOne(degreeReq);
        if(result?.acknowledged) {
            res.status(201).send(result);
        } else {
            res.status(500).send("Failed to create new degree.");
        }
    } catch(err: any) {
        res.status(400).send(err.message)
    }
})

// add course
adminRoute.post("/course", async(req, res) => {
    try {
        const courseReq = req.body;
        const result = await course.course.insertOne(courseReq);
        if(result?.acknowledged) {
            res.status(201).send(result);
        } else {
            res.status(500).send("Failed to create new course.");
        }
    } catch(err: any) {
        res.status(400).send(err.message)
    }
})

// add university
adminRoute.post("/university", async(req, res) => {
    try {
        const univReq = req.body;
        const result = await university.university.insertOne(univReq);
        if(result?.acknowledged) {
            res.status(201).send(result);
        } else {
            res.status(500).send("Failed to create new university.");
        }
    } catch(err: any) {
        res.status(400).send(err.message)
    }
})

// add skill
adminRoute.post("/skills", async(req, res) => {
    try {
        const skillsReq = req.body;
        const result = await skill.skill.insertOne(skillsReq);
        if(result?.acknowledged) {
            res.status(201).send(result);
        } else {
            res.status(500).send("Failed to create new skill.");
        }
    } catch(err: any) {
        res.status(400).send(err.message)
    }
})

// delete all skills
adminRoute.delete("/skills", async (req, res) => {
    try {
        const result = await skill.skill?.deleteMany();
        // const result = await skill.itemName?.deleteMany();
  
        if (result && result.deletedCount) {
            res.status(202).send(`Removed an employee: ID`);
        } else if (!result) {
            res.status(400).send(`Failed to remove an employee: ID`);
        } else if (!result.deletedCount) {
            res.status(404).send(`Failed to find an employee: ID`);
        }
    } catch (error: any) {
        console.error(error.message);
        res.status(400).send(error.message);
    }
 });
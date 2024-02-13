import * as express from "express";
import * as mongodb from "mongodb";
import { users } from "../database";
import path from "path";
import { CandidateInfo } from "../models/roles";
 
export const candidateRoute = express.Router();
candidateRoute.use(express.json());

const multer = require('multer');
const storage = multer.diskStorage({
  destination: (_req: any, _file: any, done: any) => {
    done(null, path.join(__dirname, './../../uploads/'));
  },
    filename: function (_req: any, file: any, cb: any) {
        cb(null, file.originalname)
    }
});
const upload = multer({
  storage
});

//  update user
candidateRoute.put("/:id", upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'banner', maxCount: 1 },
    { name: 'resume', maxCount: 1 }
 ]), async (req, res) => {
    try {
        const id = req?.params?.id;
        const newImage = (req.files as any)['image']?.[0]?.filename;
        const banner = (req.files as any)['banner']?.[0]?.filename;
        const resume = (req.files as any)['resume']?.[0]?.filename;
        const employee = req.body;
        const query = { _id: new mongodb.ObjectId(id) };
        
        const result = await users.users?.updateOne(query, { $set: { 
            "role.data.candidateInfo": {
                "image": newImage,
                "banner": banner,
                "name": employee.name,
                "phone": employee.phone,
                "designation": employee.designation,
                "location": employee.location,
                "salary": employee.salary,
                "skills": employee.skills,
                "resume": resume,
                "about": employee.about,
                "education": employee.education,
                "work": employee.work
            }
        } });
  
        if (result && result.matchedCount) {
            res.status(200).send(result);
        } else if (!result?.matchedCount) {
            res.status(404).send(`Failed to find an employee: ID ${id}`);
        } else {
            res.status(304).send(`Failed to update an employee: ID ${id}`);
        }
    } catch (error: any) {
        console.error(error.message);
        res.status(400).send(error.message);
    }
 });

// get applied job posts
candidateRoute.get("/applied/:id", async(req, res) => {
    try {
        const id = req.params.id;
        const jobPosts = await users.users?.aggregate([
            {
                $unwind: "$role.data.job_posts"
            },
            {
                $unwind: "$role.data.job_posts.applicants"
            },
            {
                $match: {
                    "role.data.job_posts.applicants.id": id
                }
            },
            {
                $group: {
                    _id: "$role.data.job_posts._jobId",
                    jobPost: {
                        $first: "$role.data.job_posts"
                    },
                    employerInfo: {
                        $first: "$role.data.employerInfo"
                    },
                    employerId: {
                        $first: "$_id"
                    }
                }
            },
            {
                $replaceRoot: { 
                    newRoot: {
                        $mergeObjects: [
                            "$jobPost", 
                            { employerInfo: "$employerInfo", employerId: "$employerId" }
                        ]
                    }
                }
            }
        ]).toArray();
        res.json({ 
            applied: jobPosts
         })
    } catch(error) {
        res.status(500).json({ error: 'Internal server error' })
    }
})

// get job posts invites
candidateRoute.get("/invite/:id", async(req, res) => {
    try {
        const id = req.params.id;
        const jobPosts = await users.users?.aggregate([
            {
                $unwind: "$role.data.job_posts"
            },
            {
                $unwind: "$role.data.job_posts.invited"
            },
            {
                $match: {
                    "role.data.job_posts.invited.id": id
                }
            },
            {
                $group: {
                    _id: "$role.data.job_posts._jobId",
                    jobPost: {
                        $first: "$role.data.job_posts"
                    },
                    employerInfo: {
                        $first: "$role.data.employerInfo"
                    },
                    employerId: {
                        $first: "$_id"
                    }
                }
            },
            {
                $replaceRoot: { 
                    newRoot: {
                        $mergeObjects: [
                            "$jobPost", 
                            { employerInfo: "$employerInfo", employerId: "$employerId" }
                        ]
                    }
                }
            }
        ]).toArray();
        res.json({ 
            invite: jobPosts
         })
    } catch(error) {
        res.status(500).json({ error: 'Internal server error' })
    }
})

 // search candidates filter
candidateRoute.get("/search-candidates", async(req, res) => {
    try {

        const queryCon = (params: CandidateInfo): any => {
            const query: any = {};

            if(params.skills) {
                const skillsToSearch = params.skills.split(',');
                query["role.data.candidateInfo.skills.itemName"] = {$all: skillsToSearch}
            }
            return query
        }

        const queryParams: CandidateInfo = {
            skills: req.query.skills as string
        }

        const unwindStage = {
            $unwind: "$role.data.candidateInfo"
        }

        const matchStage = {
            $match: queryCon(queryParams)
        }

        const result = await users.users?.aggregate([
            unwindStage,
            matchStage
        ]).toArray();
        res.status(200).send(result)
    } catch(err:any) {
        res.status(500).send(err.message)
    }
})
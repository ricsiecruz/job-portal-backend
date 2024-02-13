import * as express from "express";
import * as mongodb from "mongodb";
import { users } from "../database";
import path from "path";
import { JobPosts } from "../models/roles";
 
export const userRoute = express.Router();
userRoute.use(express.json());

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

// get all users
userRoute.get("/", async (_req, res) => {
   try {
       const employees = await users.users?.find({}).toArray();
       res.status(200).send(employees);
   } catch (error: any) {
       res.status(500).send(error.message);
   }
});

userRoute.get("/jobPosts", async(req, res) => {
    try {
        const result = await users.users?.find({
            "role.data.job_posts": { $exists: true }
        }).toArray();
        res.status(200).send(result)
    } catch(err: any) {
        res.status(500).send(err.message)
    }
})

// get all job posts
userRoute.get("/jobPosts2", async(req, res) => {
    try {
        const result = await users.users?.aggregate([
            {
                $unwind: "$role.data.job_posts"
            },
            {
                $addFields: {
                    "role.data.job_posts.company": "$role.data.employerInfo.company"
                }
            }
        ]).toArray();
        console.log(result)
        res.status(200).send(result)
    } catch(err: any) {
        res.status(500).send(err.message)
    }
})

 //  get job post by id
 //  jobPosts/{id}?jobId={_jobId}
 //  id is employer id
 userRoute.get("/jobPosts/:id", async (req, res) => {
    try {
        const employerId = req?.params?.id;
        const jobIdToFind = req.query.jobId;

        if(!jobIdToFind) {
            return res.status(400).json({error: 'missing job id parameter'})
        }
        const user = await users.users?.findOne({ _id: new mongodb.ObjectId(employerId) }
        )
        if(!user || !user.role.data.job_posts) {
            return res.status(400).json({ error: "user or Job post not found" })
        }
        const job_details = user.role.data.job_posts.find(post => 
            post._jobId?.toString() === jobIdToFind
        )
        if(!job_details) {
            return res.status(400).json({ error: "Job post not found" })
        }
        res.json({job_details})
    } catch(err: any) {
        res.status(500).send(err.message)
    }
  });

// get jobs by category
userRoute.get("/jobs-by-category", async(req, res) => {
    try {
        const category = req.query.category

        const result = await users.users?.aggregate([
            {
                $unwind: "$role.data.job_posts"
            },
            {
                $match: {
                    'role.data.job_posts.category': category
                }
            }
        ]).toArray();
        console.log(JSON.stringify(result))
        res.status(200).send(result)
    } catch(err: any) {
        res.status(500).send(err.message)
    }
})

// get job post applicants
//  applicants/{id}?jobId={_jobId}
//  id is employer id
userRoute.get("/applicants/:id", async(req, res) => {
    try {
        const employerId = req?.params?.id;
        const jobIdToFind = req.query.jobId;

        if(!jobIdToFind) {
            return res.status(400).json({error: 'missing job id parameter'})
        }
        const user = await users.users?.findOne({ _id: new mongodb.ObjectId(employerId) }
        )
        if(!user || !user.role.data.job_posts) {
            return res.status(400).json({ error: "user or Job post not found" })
        }
        const jobPost = user.role.data.job_posts.find(post => post._jobId?.toString() === jobIdToFind)
        if(!jobPost) {
            return res.status(400).json({ error: "Job post not found" })
        }
        const { applicants } = jobPost;
        res.json({ applicants })
    } catch(err: any) {
        res.status(500).send(err.message)
    }
})

// search jobs filter
userRoute.get("/search-jobs", async(req, res) => {
    try {

        const queryCon = (params: JobPosts): any => {
            const query: any = {};
            if(params.location) {
                query["role.data.employerInfo.location"] = params.location
            }
            if(params.designation) {
                query["role.data.job_posts.designation"] = new RegExp(params.designation, 'i')
            }
            if(params.category) {
                query["role.data.job_posts.category"] = params.category
            }
            if(params.position) {
                query["role.data.job_posts.position"] = params.position
            }
            if(params.setup) {
                query["role.data.job_posts.setup"] = params.setup
            }
            return query
        }

        const queryParams: JobPosts = {
            location: req.query.location as string,
            designation: req.query.designation as string,
            category: req.query.category as string,
            position: req.query.position as string,
            setup: req.query.setup as string
        }

        const unwindStage = {
            $unwind: "$role.data.job_posts"
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

//  get count of jobs according to category
userRoute.get("/jobPosts2/find/category", async(req, res) => {
    try {
        const result = await users.users?.aggregate([
            {
                $unwind: "$role.data.job_posts"
            },
            {
                $group: {
                    _id: {
                        "category": "$role.data.job_posts.category"
                    },
                    count: {
                        $sum: 1
                    }
                }
            },
        ]).toArray();
        console.log(result)
        res.status(200).send(result)
    } catch(err: any) {
        res.status(500).send(err.message)
    }
})

// delete all users
userRoute.delete("/", async (req, res) => {
    try {
        const result = await users.users?.deleteMany();
  
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

//  delete job posts with no _jobId
userRoute.delete("/jobPosts", async(req, res) => {
    try {
        const hasJobPosts = await users.users.findOne({"role.data.job_posts":{$exists: true}})
        if(hasJobPosts) {
            const result = await users.users.updateMany(
                {
                    "role.data.job_posts": { $elemMatch: {
                        _jobId: null
                    } }
                },
                { $unset: { "role.data.job_posts": "" } }
            );
        
            if(result.modifiedCount > 0) {
                res.status(200).json({message: "Job posts with no id deleted successfully"})
            } else {
                res.status(404).json({message: "No job posts found with no id"})
            }
        }
    } catch(error: any) {
        res.status(500).send(error.message)
    }
})

//  get user by id
userRoute.get("/:id", async (req, res) => {
    try {
        const id = req?.params?.id;
        const query = { _id: new mongodb.ObjectId(id) };
        const employee = await users.users?.findOne(query);
  
        if (employee) {
            console.log(employee) 
            res.status(200).send(employee);
        } else {
            res.status(404).send(`Failed to find an employee: ID ${id}`);
        }
  
    } catch (error) {
        res.status(404).send(`Failed to find an employee: ID ${req?.params?.id}`);
    }
 });

 //  add user
 userRoute.post("/", async (req, res) => {
    try {
        const newUser = req.body;
        const existingUser = await users.users.findOne({ email: req.body.email })
        if(existingUser) {
            return res.status(400).json({ error: 'This email already exists' })
        }

        await users.users.insertOne(newUser)
        return res.status(201).json(newUser)
    } catch (error: any) {
        console.error(error);
        res.status(400).send(error.message);
    }
 });

 //  login user
 userRoute.post('/login', async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const user = await users.users.findOne({ email });
        if(user) {
            if(user.password === password) {
                res.status(200).json({ success: true, user })
            } else {
                res.status(401).json({ success: false, message: 'Incorrect password' })
            }
        } else {
            res.status(404).json({ success: false, message: 'User does not exist' })
        }
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
 });

 // add job post
 userRoute.post("/:id/add", async (req, res) => {
    try {
        const id = req?.params?.id;
        const employee = req.body;
        const query = { _id: new mongodb.ObjectId(id) };

        const result = await users.users?.updateOne(query, { $push: { "role.data.job_posts": {
            _jobId : new mongodb.ObjectId(),
            designation: employee.designation,
            description: employee.description,
            date_posted: Date.now(),
            category: employee.category,
            position: employee.position,
            urgent: employee.urgent,
            setup: employee.setup,
            minSalary: employee.minSalary,
            maxSalary: employee.maxSalary,
            rate: employee.rate
        }}});

        if (result && result.matchedCount) {
            console.log('res', result)
            res.status(200).send(result);
        } else if (!result?.matchedCount) {
            res.status(404).send(result);
        } else {
            res.status(304).send(result);
        }
    } catch (error: any) {
        console.error(error);
        res.status(400).send(error.message);
    }
 })

 //  update user
 userRoute.put("/:id", upload.fields([
    { name: 'logo', maxCount: 1 },
    { name: 'banner', maxCount: 1 }
 ]), async (req, res) => {
    try {
        const id = req?.params?.id;
        const newImage = (req.files as any)['logo']?.[0]?.filename;
        const banner = (req.files as any)['banner']?.[0]?.filename;
        const employee = req.body;
        const query = { _id: new mongodb.ObjectId(id) };
        
        const result = await users.users?.updateOne(query, { $set: { 
            "role.data.employerInfo": {
                "logo": newImage,
                "banner": banner,
                "company": employee.company,
                "about": employee.about,
                "industry": employee.industry,
                "location": employee.location
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

//  update job post
//  jobPosts/{id}?jobId={_jobId}
//  id is employer id
userRoute.put("/jobPosts/:id", async(req, res) => {
    try {
        const userId = req?.params?.id;
        const jobIdToUpdate = req.query.jobId as string;
        const data = req.body;

        const user = await users.users?.findOne({_id: new mongodb.ObjectId(userId)})
        if(!user) {
            return res.status(404).json({error: "user not found"})
        }
        if(!user.role.data.job_posts || !Array.isArray(user.role.data.job_posts)) {
            return res.status(500).json({error: "job post array is missing or not an array"})
        }

        const indexToUpdate = user.role.data.job_posts.findIndex((post) => post?._jobId?.toString() === jobIdToUpdate)
        if(indexToUpdate === -1) {
            return res.status(404).json({error: "job post not foud"})
        }

        user.role.data.job_posts[indexToUpdate] = data;

        const updateResult = await users.users?.updateOne({_id: new mongodb.ObjectId(userId)}, {$set: {"role.data.job_posts": user.role.data.job_posts}})
        if(!updateResult || updateResult.modifiedCount !== 1) {
            return res.status(500).json({error: "failed to update"})
        }

        res.json({user, updatedJobPost:user.role.data.job_posts[indexToUpdate]})

    } catch(err: any) {
        res.status(500).send(err.message)
    }
})

//  apply to job post
//  apply2/{id}?jobId={_jobId}
//  id is employer id
 userRoute.post("/apply2/:id", async (req, res) => {
    try {
        const employerId = req?.params?.id;
        const jobId = req.query.jobId as string;
        const query = { _id: new mongodb.ObjectId(employerId)};
        const data = req.body;
        const result = await users.users?.updateOne(query, {
            $push: {
                "role.data.job_posts.$[jobPost].applicants": {
                        id: data.id,
                        email: data.email,
                        date_applied: Date.now(),
                        candidateInfo: data.candidateInfo
                }
            },
        },
        {
            arrayFilters: [{"jobPost._jobId": new mongodb.ObjectId(jobId)}]
        })
        
        if (result && result.matchedCount) {
            res.status(200).send(result);
        } else if (!result?.matchedCount) {
            res.status(404).send(result);
        } else {
            res.status(304).send(result);
        }
    } catch (error: any) {
        console.error(error);
        res.status(400).send(error.message);
    }
 })

//  invite applicant
//  apply2/{id}?jobId={_jobId}
//  id is employer id
userRoute.post("/invite/:id", async (req, res) => {
    try {
        const employerId = req?.params?.id;
        const jobId = req.query.jobId as string;
        const query = { _id: new mongodb.ObjectId(employerId)};
        const data = req.body;
        const result = await users.users?.updateOne(query, {
            $push: {
                "role.data.job_posts.$[jobPost].invited": {
                        id: data.id,
                        email: data.email,
                        date_invited: Date.now(),
                        candidateInfo: data.candidateInfo
                }
            },
        },
        {
            arrayFilters: [{"jobPost._jobId": new mongodb.ObjectId(jobId)}]
        })
        
        if (result && result.matchedCount) {
            res.status(200).send(result);
        } else if (!result?.matchedCount) {
            res.status(404).send(result);
        } else {
            res.status(304).send(result);
        }
    } catch (error: any) {
        console.error(error);
        res.status(400).send(error.message);
    }
 })

 //  delete user
 userRoute.delete("/:id", async (req, res) => {
    try {
        const id = req?.params?.id;
        const query = { _id: new mongodb.ObjectId(id) };
        const result = await users.users?.deleteOne(query);
  
        if (result && result.deletedCount) {
            res.status(202).send(`Removed an employee: ID ${id}`);
        } else if (!result) {
            res.status(400).send(`Failed to remove an employee: ID ${id}`);
        } else if (!result.deletedCount) {
            res.status(404).send(`Failed to find an employee: ID ${id}`);
        }
    } catch (error: any) {
        console.error(error.message);
        res.status(400).send(error.message);
    }
 });

 //  delete job post
 userRoute.delete("/:id/job/:jobId", async (req, res) => {
    try {
        const id = req?.params?.id;
        const jobId = req?.params?.jobId
        const query = { _id: new mongodb.ObjectId(id) };
        const result = await users.users?.updateOne(query,{$pull : {"role.data.job_posts" : { _jobId : new mongodb.ObjectId(jobId)}}});
        console.log('res', result)
        if(result && result.matchedCount) {
            res.status(202).send(`Removed job post with ID: ${jobId}`);
        } else if(!result) {
            res.status(400).send(`Failed to remove job post with ID: ${jobId}`);
        } else if(!result.matchedCount) {
            res.status(404).send(`Failed to find job post with ID: ${jobId}`);
        }
    } catch (err) {
        res.status(400).send(err.message)
    }
 })
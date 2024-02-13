import * as mongodb from "mongodb";
import { Employee } from "./employee";
import { Users } from "./models/users";
import { Category, Course, EducDegree, Position, Rate, Setup, Skills, University } from "./models/category";
import { JobList, Roles } from "./models/roles";
 
export const collections: {
   employees?: mongodb.Collection<Employee>;
} = {};

export const users: {
    users?: mongodb.Collection<Users>;
} = {};

export const jobList: {
    jobsList?: mongodb.Collection<JobList>;
} = {};

export const category: {
    category?: mongodb.Collection<Category>;
} = {};

export const position: {
    position?: mongodb.Collection<Position>;
} = {};

export const setup: {
    setup?: mongodb.Collection<Setup>;
} = {};

export const rate: {
    rate?: mongodb.Collection<Rate>;
} = {};

export const role: {
    role?: mongodb.Collection<Roles>;
} = {};

export const skill: {
    skill?: mongodb.Collection<Skills>;
} = {};

export const educDegree: {
    degree?: mongodb.Collection<EducDegree>;
} = {};

export const course: {
    course?: mongodb.Collection<Course>;
} = {};

export const university: {
    university?: mongodb.Collection<University>;
} = {};
 
export async function connectToDatabase(uri: string) {
   const client = new mongodb.MongoClient(uri);
   await client.connect();
 
   const employeesdb = client.db("meanStackExample");
   await applySchemaValidation(employeesdb);
 
   const employeesCollection = employeesdb.collection<Employee>("employees");
   collections.employees = employeesCollection;

   const database = client.db("job-portal");
   await jobPortalSchemaValidation(database);
   await jobListSchema(database);
   await categorySchema(database);
   await positionSchema(database);
   await setupSchema(database);
   await rateSchema(database);
   await roleSchema(database);
   await skillSchema(database);
   await educDegreeSchema(database);
   await courseSchema(database);
   await universitySchema(database);

   const usersCollection = database.collection<Users>("users");
   users.users = usersCollection;

   const jobListCollection = database.collection<JobList>("jobList");
   jobList.jobsList = jobListCollection;

   const categoryCollection = database.collection<Category>("category");
   category.category = categoryCollection;

   const positionCollection = database.collection<Position>("position");
   position.position = positionCollection;

   const setupCollection = database.collection<Setup>("setup");
   setup.setup = setupCollection;

   const rateCollection = database.collection<Rate>("rate");
   rate.rate = rateCollection;

   const roleCollection = database.collection<Roles>("role");
   role.role = roleCollection;

   const skillsCollection = database.collection<Skills>("skill");
   skill.skill = skillsCollection;

   const educDegreeCollection = database.collection<EducDegree>("degree");
   educDegree.degree = educDegreeCollection;

   const courseCollection = database.collection<Course>("course");
   course.course = courseCollection;

   const universityCollection = database.collection<University>("university");
   university.university = universityCollection;
}
 
// Update our existing collection with JSON schema validation so we know our documents will always match the shape of our Employee model, even if added elsewhere.
// For more information about schema validation, see this blog series: https://www.mongodb.com/blog/post/json-schema-validation--locking-down-your-model-the-smart-way
async function applySchemaValidation(db: mongodb.Db) {
   const jsonSchema = {
       $jsonSchema: {
           bsonType: "object",
           required: ["name", "position", "level"],
           additionalProperties: false,
           properties: {
               _id: {},
               name: {
                   bsonType: "string",
                   description: "'name' is required and is a string",
               },
               position: {
                   bsonType: "string",
                   description: "'position' is required and is a string",
                   minLength: 5
               },
               level: {
                   level: {
                    bsonType: "string",
                    description: "'level' is required and is one of 'junior', 'mid', or 'senior'",
                    enum: ["junior", "mid", "senior"],
                   },
                   details: {
                    bsonType: ["array"],
                    job_posts: {
                        bsonType: ["object"],
                        _jobId: {},
                        designation: {
                            bsonType: "string",
                            designation: "'designation' is required"
                        },
                        description: {
                            bsonType: "string",
                            description: "'description' is required"
                        }
                    }
                   }
               },
           },
       },
   };
}

async function jobPortalSchemaValidation(db: mongodb.Db) {
    const jsonSchema = {
        $jsonSchema: {
            bsonType: "object",
            required: ["role", "email", "password", "confirm_pass"],
            additionalProperties: false,
            properties: {
                _id: {},
                email: {
                    bsonType: "string",
                    description: "'email' is required and is a string"
                },
                password: {
                    bsonType: "string",
                    description: "'password' is required and is a string"
                },
                confirm_pass: {
                    bsonType: "string",
                    description: "'confirm_pass' is required and is a string"
                },
                role: {
                    role: {
                        bsonType: "string",
                        description: "'role' is required and is a string",
                        enum: ["employer", "candidate"],
                    },
                    data: {
                     bsonType: ["array"],
                     job_posts: {
                         bsonType: ["object"],
                         _jobId: {},
                         designation: {
                             bsonType: "string",
                             description: "'designation' is required"
                         },
                         description: {
                             bsonType: "string",
                             description: "'description' is required"
                         },
                         category: {
                            bsonType: "string",
                            description: "'category' is required"
                         },
                         date_posted: {
                            bsonType: "string",
                            description: "date posted"
                         },
                         position: {
                            bsonType: "string",
                            description: "'position' is required",
                            enum: ["temporary", "full-time", "freelance", "internship"]
                         },
                         urgent: {
                            bsonType: "boolean",
                            description: "required"
                         },
                         setup: {
                            bsonType: "string",
                            description: "'setup' is required",
                            enum: ["remote", "on-site", "hybrid"]
                         },
                         minSalary: {
                            bsonType: "number",
                            description: "Minimum salary"
                         },
                         maxSalary: {
                            bsonType: "number",
                            description: "Maximum salary"
                         },
                         payment: {
                            bsonType: "string",
                            description: "'payment' is required",
                            enum: ["monthly", "hourly"]
                         }
                     }
                    }
                },
            },
        },
    };
 
   // Try applying the modification to the collection, if the collection doesn't exist, create it
  await db.command({
       collMod: "employees",
       validator: jsonSchema
   }).catch(async (error: mongodb.MongoServerError) => {
       if (error.codeName === 'NamespaceNotFound') {
           await db.createCollection("employees", {validator: jsonSchema});
       }
   });

   await db.command({
        collMod: "users",
        validator: jsonSchema
   }).catch(async (error: mongodb.MongoServerError) => {
        if(error.codeName === 'NamespaceNotFound') {
            await db.createCollection("users", {validator: jsonSchema})
        }
   })

   await db.command({
    collMod: "jobList",
    validator: jsonSchema
   }).catch(async (error: mongodb.MongoServerError) => {
    if(error.codeName === 'NameSpaceNotFound') {
        await db.createCollection("jobList", {validator: jsonSchema})
    }
   })

   await db.command({
    collMod: "category",
    validator: jsonSchema
   }).catch(async (error: mongodb.MongoServerError) => {
    if(error.codeName === 'NamespaceNotFound') {
        await db.createCollection("category", {validator: jsonSchema})
    }
   })

   await db.command({
    collMod: "position",
    validator: jsonSchema
   }).catch(async (error: mongodb.MongoServerError) => {
    if(error.codeName === 'NamespaceNotFound') {
        await db.createCollection("position", { validator: jsonSchema })
    }
   })

   await db.command({
    collMod: "setup",
    validator: jsonSchema
   }).catch(async (error: mongodb.MongoServerError) => {
    if(error.codeName === 'NamespaceNotFound') {
        await db.createCollection("setup", {validator: jsonSchema})
    }
   })

   await db.command({
    collMod: "rate",
    validator: jsonSchema
   }).catch(async (error: mongodb.MongoServerError) => {
    if(error.codeName === 'NamespaceNotFound') {
        await db.createCollection("rate", {validator: jsonSchema})
    }
   })

   await db.command({
    collMod: "role",
    validator: jsonSchema
   }).catch(async (error: mongodb.MongoServerError) => {
    if(error.codeName === 'NamespaceNotFound') {
        await db.createCollection("role", { validator: jsonSchema })
    }
   })

   await db.command({
    collMod: "skills",
    validator: jsonSchema
   }).catch(async (error: mongodb.MongoServerError) => {
    if(error.codeName === 'NamespaceNotFound') {
        await db.createCollection("skills", { validator: jsonSchema })
    }
   })

   await db.command({
    collMod: "degree",
    validator: jsonSchema
   }).catch(async (error: mongodb.MongoServerError) => {
    if(error.codeName === 'NamespaceNotFound') {
        await db.createCollection("degree", { validator: jsonSchema })
    }
   })

   await db.command({
    collMod: "course",
    validator: jsonSchema
   }).catch(async (error: mongodb.MongoServerError) => {
    if(error.codeName === 'NamespaceNotFound') {
        await db.createCollection("course", { validator: jsonSchema })
    }
   })

   await db.command({
    collMod: "university",
    validator: jsonSchema
   }).catch(async (error: mongodb.MongoServerError) => {
    if(error.codeName === 'NamespaceNotFound') {
        await db.createCollection("university", { validator: jsonSchema })
    }
   })
}

async function jobListSchema(db: mongodb.Db) {
    const jsonSchema = {
        $jsonSchema: {
            bsonType: ["object"],
                _jobId: {},
                logo: {
                    bsonType: "string",
                    description: "'logo' is required"
                },
                banner: {
                    bsonType: "string",
                    description: "banner"
                },
                company: {
                    bsonType: "string",
                    description: "'company' is required"
                },
                location: {
                    bsonType: "string",
                    description: "'location' is required"
                },
                designation: {
                    bsonType: "string",
                    description: "'designation' is required"
                },
                description: {
                    bsonType: "string",
                    description: "'description' is required"
                },
                category: {
                    bsonType: "string",
                    description: "'category' is required"
                },
                date_posted: {
                    bsonType: "string",
                    description: "date posted"
                },
                position: {
                    bsonType: "string",
                    description: "'position' is required",
                    enum: ["temporary", "full-time", "freelance", "internship"]
                },
                urgent: {
                    bsonType: "boolean",
                    description: "required"
                },
                setup: {
                    bsonType: "string",
                    description: "'setup' is required",
                    enum: ["remote", "on-site", "hybrid"]
                },
                minSalary: {
                    bsonType: "number",
                    description: "Minimum salary"
                },
                maxSalary: {
                    bsonType: "number",
                    description: "Maximum salary"
                },
                payment: {
                    bsonType: "string",
                    description: "'payment' is required",
                    enum: ["monthly", "hourly"]
                }
        }
    }
}

async function categorySchema(db: mongodb.Db) {
    const jsonSchema = {
        $jsonSchema: {
            bsonType: "object",
            required: ["category"],
            additionalProperties: false,
            properties: {
                _categoryId: {},
                category: {
                    bsonType: "string",
                    description: "'category' is required"
                }
            }
        }
    }
}

async function positionSchema(db: mongodb.Db) {
    const jsonSchema = {
        $jsonSchema: {
            bsonType: "object",
            required: ["position"],
            additionalProperties: false,
            properties: {
                _positionId: {},
                position: {
                    bsonType: "string",
                    description: "position"
                }
            }
        }
    }
}

async function setupSchema(db: mongodb.Db) {
    const jsonSchema = {
        $jsonSchema: {
            bsonType: "object",
            required: ["setup"],
            additionalProperties: false,
            properties: {
                _setupId: {},
                setup: {
                    bsonType: "string",
                    description: "setup"
                }
            }
        }
    }
}

async function rateSchema(db: mongodb.Db) {
    const jsonSchema = {
        $jsonSchema: {
            bsonType: "object",
            required: ["rate"],
            additionalProperties: false,
            properties: {
                _rateId: {},
                rate: {
                    bsonType: "string",
                    description: "rate"
                }
            }
        }
    }
}

async function roleSchema(db: mongodb.Db) {
    const jsonSchema = {
        $jsonSchema: {
            bsonType: "object",
            required: ["role"],
            additionalProperties: false,
            properties: {
                _roleId: {},
                role: {
                    bsonType: "string",
                    description: "role"
                }
            }
        }
    }
}

async function skillSchema(db: mongodb.Db) {
    const jsonSchema = {
        $jsonSchema: {
            bsonType: "object",
            required: ["skill"],
            additionalProperties: false,
            properties: {
                _skillId: {},
                skill: {
                    bsonType: "string",
                    description: "skill"
                }
            }
        }
    }
}

async function educDegreeSchema(db: mongodb.Db) {
    const jsonSchema = {
        $jsonSchema: {
            bsonType: "object",
            required: ["degree"],
            additionalProperties: false,
            properties: {
                id: {},
                degree: {
                    bsonType: "string",
                    description: "degree"
                }
            }
        }
    }
}

async function courseSchema(db: mongodb.Db) {
    const jsonSchema = {
        $jsonSchema: {
            bsonType: "object",
            required: ["course"],
            additionalProperties: false,
            properties: {
                id: {},
                course: {
                    bsonType: "string",
                    description: "degree"
                }
            }
        }
    }
}

async function universitySchema(db: mongodb.Db) {
    const jsonSchema = {
        $jsonSchema: {
            bsonType: "object",
            required: ["university"],
            additionalProperties: {
                id: {},
                university: {
                    bsonType: "string",
                    description: "university"
                }
            }
        }
    }
}
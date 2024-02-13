import * as mongodb from "mongodb";
 
export interface Employee {
   name: string;
   position: string;
   level: Level;
   _id?: mongodb.ObjectId;
}

interface Level {
   level: "junior" | "mid" | "senior";
   details: Details;
}

interface Details {
   job_posts: JobPosts[];
}

interface JobPosts {
   _jobId?: mongodb.ObjectId;
   designation: string;
   description: string;
}
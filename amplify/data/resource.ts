import { type ClientSchema, a, defineData } from '@aws-amplify/backend'

/*== STEP 1 ===============================================================
The section below creates a Todo database table with a "content" field. Try
adding a new "isDone" field as a boolean. The authorization rule below
specifies that any user authenticated via an API key can "create", "read",
"update", and "delete" any "Todo" records.
=========================================================================*/
const schema = a.schema({
  User: a
    .model({
      id: a.id(),
      username: a.string(),
      email: a.string(),
      savedRecipes: a.hasMany('SavedRecipe', 'userId'), // Link to SavedRecipe join model
    })
    .authorization((allow) => [allow.authenticated()]),

  Recipe: a
    .model({
      id: a.id(),
      createdBy: a.string(),
      name: a.string(),
      description: a.string(),
      course: a.string(),
      time: a.string(),
      numServings: a.string(),
      difficulty: a.string(),
      ingredients: a.string().array(),
      instructions: a.string().array(),
      owner: a.string(),
      imageFileNames: a.string().array(),
      averageRating: a.integer(),
      numReviews: a.integer(),
      reviews: a.hasMany('Review', 'recipeId'), // Define relationship
    })
    .authorization((allow) => [allow.authenticated()]),

  SavedRecipe: a
    .model({
      id: a.id(),
      userId: a.belongsTo('User', 'userId'), // Reference to the User model
      recipeId: a.belongsTo('Recipe', 'recipeId'), // Reference to the Recipe model
    })
    .authorization((allow) => [allow.authenticated()]),

  Review: a
    .model({
      id: a.id(),
      reviewStars: a.integer(),
      reviewText: a.string(),
      recipeId: a.string(), // Foreign key to reference Recipe
      recipe: a.belongsTo('Recipe', 'recipeId'), // Define relationship back to Recipe
      createdBy: a.string(),
      owner: a.string(),
    })
    .authorization((allow) => [
      allow.authenticated(), // All authenticated users can read.
    ]),
})

export type Schema = ClientSchema<typeof schema>

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool',
  },
})

/*== STEP 2 ===============================================================
Go to your frontend source code. From your client-side code, generate a
Data client to make CRUDL requests to your table. (THIS SNIPPET WILL ONLY
WORK IN THE FRONTEND CODE FILE.)

Using JavaScript or Next.js React Server Components, Middleware, Server 
Actions or Pages Router? Review how to generate Data clients for those use
cases: https://docs.amplify.aws/gen2/build-a-backend/data/connect-to-API/
=========================================================================*/

/*
"use client"
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";

const client = generateClient<Schema>() // use this Data client for CRUDL requests
*/

/*== STEP 3 ===============================================================
Fetch records from the database and use them in your frontend component.
(THIS SNIPPET WILL ONLY WORK IN THE FRONTEND CODE FILE.)
=========================================================================*/

/* For example, in a React component, you can use this snippet in your
  function's RETURN statement */
// const { data: todos } = await client.models.Todo.list()

// return <ul>{todos.map(todo => <li key={todo.id}>{todo.content}</li>)}</ul>

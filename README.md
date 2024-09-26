## Viviboom Admin


### Set up
1. Install npm & node
2. Git pull repo
3. `npm install`
4. `npm run start-dev`
5. If you get the error for step 4, you can either change the value for "start-dev" in package.json from `start-dev`: `cross-env PORT=3029 NODE_ENV=development react-scripts start` to `start-dev`: `cross-env PORT=3029 NODE_ENV=development react-scripts --openssl-legacy-provider start`, or downgrade your node to version 14
6. Set up express-viviboom if you haven't already so that the backend is also running


Frontend is hosted on
Local: http://localhost:3029/

Dev: https://www.release-admin.viviboom.co/
Prod: https://www.admin.viviboom.co/

### Admin privileges 
Admins are able to create new staff roles and assign them privileges of different levels for various functions. There are 4 levels of privileges - None (0), Read (1), Update (2), Create and Delete (3) and 5 types of functions -  Staff Role, User, Badge, Event, and Project. 

For instance, an admin can create a Crew staff role, and give that staff role level 0 privilege for Staff Role, level 2 previleges for User, Badge, and Project, and level 3 privilege for Event. This means that the Crew can update user details, event details, and project details. The Crew will also be able to create and delete projects.   

### Collaboration guidelines
YOU MUST REPLACE ALL LOGOS, IMAGES AND ANIMATIONS USED TO YOUR OWN. THE IMAGES AND ANIMATIONS USED IN THE SOURCE CODE ARE COPYRIGHTED AND PROVIDED ONLY AS REFERENCE MATERIAL

1. Create new branch called feature/* or fix/*. For instance, fix/read-me
2. Make a pull request
3. Assign someone to review the request


### File structure
The structure of this repo is as follows: 

1. Apis - Keeps files related to API
2. Components - Anything that will load on the screen by itself
3. Config - Sets up multi-environment configurations in the application
4. Css - Stores all the images and styles
5. Data - Stores global constant variables
6. Enums - Defines a set of named constants
7. Redux - Stores the actions and reducers used in redux 
8. Store - Data that needs to be used across multiple components and/or needs predictable state
9. Tests - Verifies that the component renders properly
10. Translations - Maintains a collection of translated terms for the views that necessitate them
11. Utils - Utilities that enhance your code

### Conventions

Files - snake-case
Enums - PascalCase
Keys - PascalCase 
Variables - camelCase
Imported Objects - PascalCase

Style - Typically only use Margin & Padding in increments of 4 (unless there are obscure cases)

If the convention is not otherwise stated, refer to airbnb's convention
https://github.com/airbnb/javascript/tree/master/react

# Club Connect

Build a full-stack Attendance Management System Website for a Coding Club with a highly modern, interactive, and visually impressive UI/UX. The website should look professional, attractive, responsive, animated, and user-friendly. Use smooth transitions, hover effects, modern cards, glassmorphism/neumorphism where suitable, animated dashboards, icons, gradients, and engaging layouts. The UI should feel premium and interactive on both desktop and mobile devices.

Tech Stack:

- Frontend: HTML, CSS, JavaScript, JSON

- Backend: Python Flask

- Database: SQLite

Use a clean project structure and write modular, maintainable code.

WEBSITE REQUIREMENTS

1. USER ROLES

The system should have two types of users:

- Student

- Admin/Volunteer

2. STUDENT REGISTRATION

Students should register using:

- Full Name

- USN

- Department

- Class/Year

- Phone Number

- Password

3. STUDENT LOGIN

Students should log in using:

- USN

- Password

4. ADMIN/VOLUNTEER REGISTRATION

Admins/Volunteers should register using:

- Full Name

- Admin Registration Code

- USN

- Year

- Department

- Phone Number

- Password

Default Admin Registration Code:

admin123

Only users with the correct admin registration code should be able to register as admin/volunteer.

5. ADMIN LOGIN

Admins/Volunteers should log in using:

- Admin Registration Code

- Password

6. FORGOT PASSWORD FEATURE

Add a “Forgot Password” option on the login page for both students and admins.

When clicked:

- Show a popup/modal or form

- Ask for:

  - New Password

  - Confirm Password

- After confirmation, automatically update the password in the database.

7. STUDENT DASHBOARD

After login, students should be able to:

- View attendance overview

- View coding club sessions attended

- See:

  - Session Title

  - Host Name

  - Resource Person

  - Date

  - Small Description of Session

- View attendance percentage and session history using attractive charts and cards

- Edit their profile:

  - Change profile picture

  - Edit personal details

- View assignments:

  - Current Assignments

  - Previous Assignments

  - Status:

    - Submitted

    - Pending

- Ask questions or comment in a discussion section/community section

Students should NOT be able to:

- Add sessions

- Edit sessions

- Mark attendance

- Modify attendance records

8. ADMIN/VOLUNTEER DASHBOARD

Admins should be able to:

- View all student details

- Manage student information

- Add new sessions

- Edit existing sessions

- Delete sessions if needed

- Mark attendance for students for a particular session

- Upload/manage assignments

- Track assignment submission status

- View attendance statistics and analytics

While adding a session, admins should enter:

- Session Title

- Date

- Host Name

- Resource Person

- Small Description

9. UI/UX REQUIREMENTS (VERY IMPORTANT)

The UI and UX should be EXTREMELY attractive, modern, and interactive.

Strictly focus on:

- Premium modern design

- Smooth animations

- Animated dashboard cards

- Attractive login/signup pages

- Responsive design

- Modern typography

- Beautiful gradients

- Interactive buttons

- Hover animations

- Scroll animations

- Sidebar navigation

- Dashboard analytics charts

- Attractive attendance cards

- Video backgrounds

- Clean layouts

- Dark/light modern theme styling

Use professional UI inspiration similar to modern SaaS dashboards.

10. LOGIN PAGE BACKGROUND VIDEO

Use this video as the animated background for the login page:

https://www.pexels.com/download/video/34911968/

The login page should include:

- Glassmorphism login card

- Smooth fade animations

- Overlay effects

- Attractive input fields

- Interactive buttons

- Responsive layout

11. DATABASE REQUIREMENTS

Use SQLite database with properly designed tables for:

- Students

- Admins

- Sessions

- Attendance

- Assignments

- Comments/Questions

12. ADDITIONAL FEATURES

Include:

- Session-wise attendance tracking

- Attendance percentage calculation

- Search and filter options

- Notifications/toasts

- Validation for all forms

- Secure password handling

- Flash messages

- Clean navigation

13. OUTPUT REQUIREMENT

Generate:

- Complete frontend and backend code

- Flask routes

- SQLite database integration

- HTML templates

- CSS styling

- JavaScript functionality

- Folder structure

- Database schema

- Fully functional responsive website

Ensure the final project looks visually stunning, interactive, animated, and professional with excellent UI/UX design throughout the website.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://club-attend-charm.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/fbe6acd5-0251-4e41-8213-0a9faff9a437).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

# CMS User Guide

## Overview

The CMS is a comprehensive administrative interface built for managing all portfolio content, including projects, achievements, certificates, work history, technical skills, media uploads, contact messages, site configuration, and system user access.

## Modules & Features

1. **Dashboard (`/admin`)**:
   - Overview statistics (total projects, achievements, unread messages, media storage counts).
   - Recent messages feed with unread indicators.
   - Recent projects summary.

2. **Project Management (`/admin/projects`)**:
   - Create, edit, publish, draft, and archive projects.
   - Inline feature toggle (`Featured` badge).
   - Cover image and gallery image uploads stored directly in MinIO.
   - Categorization, tech stack tagging, problem/solution breakdown, and SEO metadata.

3. **Achievements Management (`/admin/achievements`)**:
   - Manage awards, competition wins, scholarships, and recognitions.
   - Image & PDF certificate document attachment with modal viewer.

4. **Certificates Management (`/admin/certificates`)**:
   - Log professional certifications, credential IDs, and validation links.
   - Track issue dates and expiration dates.

5. **Experience Management (`/admin/experience`)**:
   - Manage work history timeline and current job indicators.
   - Company logo file upload to MinIO.

6. **Skills Management (`/admin/skills`)**:
   - Group skills by category (Frontend, Backend, Database, DevOps, Tools).
   - Dynamic 1-100% proficiency level bars.

7. **About Section Management (`/admin/about`)**:
   - Edit full biography text and tech stack tag array.
   - Social links configuration (GitHub, LinkedIn, Instagram, Email).
   - Profile photo upload and Resume PDF file update.

8. **Media Library (`/admin/media`)**:
   - Upload images and documents to MinIO object storage.
   - Automatic WebP image optimization via Sharp.
   - Search, folder organization, inline rename, and bulk deletion.

9. **Contact Messages (`/admin/messages`)**:
   - Read incoming contact form submissions with status tabs (All/Unread/Read/Replied).
   - Mark as read, mark as replied, and direct `mailto:` integration.

10. **Site Settings (`/admin/settings`)**:
    - Configure global meta titles, site descriptions, contact emails, Google Analytics ID, and maintenance mode toggle.

11. **User Management (`/admin/users`)**:
    - Create new CMS accounts with roles (`ADMIN` or `EDITOR`).
    - Password updates and self-deletion prevention.

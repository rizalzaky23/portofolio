# Database Schema Documentation

## Entity Relationship Summary

The database uses MySQL 8.0 managed via Prisma ORM (`prisma/schema.prisma`).

### Models

1. **User**
   - System users (Admin / Editor) for CMS access.
   - Fields: `id`, `name`, `email` (unique), `passwordHash`, `role` (ADMIN|EDITOR), `avatar`, `lastLoginAt`, `createdAt`, `updatedAt`.

2. **Project**
   - Portfolio showcase items.
   - Fields: `id`, `title`, `slug` (unique), `summary`, `description`, `problem`, `solution`, `architecture`, `challenges`, `lessons`, `status` (DRAFT|PUBLISHED|ARCHIVED), `featured`, `coverImage`, `year`, `category`, `githubUrl`, `demoUrl`, `techStack` (JSON), `displayOrder`, `metaTitle`, `metaDescription`, `publishedAt`, `deletedAt`, `createdAt`, `updatedAt`.
   - Relations: Has many `ProjectImage`.

3. **ProjectImage**
   - Gallery images for projects.
   - Fields: `id`, `projectId`, `url`, `alt`, `order`, `createdAt`.

4. **Achievement**
   - Competition wins, awards, scholarships, recognitions.
   - Fields: `id`, `title`, `description`, `organizer`, `date`, `category` (competition|award|scholarship|recognition|certificate), `certificateImage`, `certificatePdf`, `featured`, `displayOrder`, `createdAt`, `updatedAt`.

5. **Certificate**
   - Professional certifications.
   - Fields: `id`, `title`, `issuer`, `credentialId`, `credentialUrl`, `issueDate`, `expirationDate`, `previewUrl`, `featured`, `displayOrder`, `createdAt`, `updatedAt`.

6. **Experience**
   - Work history and positions.
   - Fields: `id`, `company`, `position`, `description`, `logo`, `website`, `startDate`, `endDate`, `current`, `displayOrder`, `createdAt`, `updatedAt`.

7. **Skill**
   - Technical skills categorized with proficiency level.
   - Fields: `id`, `name`, `category`, `level` (1-100), `icon`, `displayOrder`, `createdAt`, `updatedAt`.

8. **About**
   - Singleton bio, tech stack, and CV downloads.
   - Fields: `id`, `biography`, `photo`, `resume`, `socialLinks` (JSON), `techStack` (JSON), `updatedAt`.

9. **Message**
   - Incoming messages sent via portfolio contact form.
   - Fields: `id`, `name`, `email`, `subject`, `body`, `status` (UNREAD|READ|REPLIED), `ipAddress`, `userAgent`, `deletedAt`, `createdAt`, `updatedAt`.

10. **Media**
    - Uploaded media registry tracking MinIO objects.
    - Fields: `id`, `filename` (unique), `originalName`, `url`, `mimeType`, `size`, `folder`, `width`, `height`, `createdAt`.

11. **Settings**
    - Site-wide key-value configuration.
    - Fields: `key` (unique), `value`, `updatedAt`.

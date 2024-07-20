## Getting Started

Before starting:

```bash
# Install packages for frontend, do this command in main directory
npm install

# Install packages for backend, do this cmmand in backend folder
pip install -r requirements.txt
```

Required authentication:
Create a .env with keys from this
- [Autodesk](https://aps.autodesk.com/developer/)
- [Supabase](https://supabase.com/)
```bash
# .env file's required variables 
NEXT_PUBLIC_AUTODESK_CLIENT_SECRET_ID=''
NEXT_PUBLIC_AUTODESK_CLIENT_SECRET=''
NEXT_PUBLIC_AUTODESK_CLIENT_BUCKET=''
NEXT_PUBLIC_SUPABASE_KEY=''
NEXT_PUBLIC_SUPABASE_SECRET=''
```

How to start the servers:
- Frontend: "start frontend.bat"
- Backend: "start backend.bat"

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

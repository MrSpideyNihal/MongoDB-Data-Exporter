# MongoDB Data Exporter

A modern web application to export MongoDB data as JSON files. Built with serverless architecture and ready for Netlify deployment.

![MongoDB Data Exporter](https://img.shields.io/badge/MongoDB-Data%20Exporter-47A248?style=for-the-badge&logo=mongodb&logoColor=white)

## ✨ Features

- 🔌 **Easy Connection**: Connect to any MongoDB instance using connection URL
- 📊 **Database Browser**: View all available databases
- 📁 **Collection Explorer**: Browse collections with document counts
- 💾 **Flexible Export**: Export single collections, multiple selections, or entire databases
- 🎨 **Modern UI**: Premium dark theme with glassmorphism and smooth animations
- 🚀 **Serverless**: Built with Netlify Functions for secure, scalable deployment
- 📱 **Responsive**: Works seamlessly on desktop and mobile devices

## 🚀 Quick Start

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- A MongoDB instance (local or cloud)

### Local Development

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd MongoDB-Data-Exporter
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run locally with Netlify Dev**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   Navigate to `http://localhost:8888`

## 🌐 Netlify Deployment

### Option 1: Deploy via Netlify CLI

1. **Install Netlify CLI** (if not already installed)
   ```bash
   npm install -g netlify-cli
   ```

2. **Login to Netlify**
   ```bash
   netlify login
   ```

3. **Initialize and deploy**
   ```bash
   netlify init
   netlify deploy --prod
   ```

### Option 2: Deploy via Netlify Dashboard

1. Push your code to GitHub, GitLab, or Bitbucket
2. Go to [Netlify](https://app.netlify.com/)
3. Click "New site from Git"
4. Select your repository
5. Configure build settings:
   - **Build command**: Leave empty or use `echo "No build required"`
   - **Publish directory**: `.` (root directory)
   - **Functions directory**: `netlify/functions` (auto-detected)
6. Click "Deploy site"

### Option 3: Deploy with Drag & Drop

1. Build is not required for this static site
2. Go to [Netlify Drop](https://app.netlify.com/drop)
3. Drag and drop the entire project folder
4. Your site will be deployed instantly!

## 📖 Usage

1. **Enter MongoDB URL**
   - Format: `mongodb://username:password@host:port/database`
   - Or use MongoDB Atlas connection string
   - Example: `mongodb+srv://user:pass@cluster.mongodb.net/`

2. **Connect**
   - Click the "Connect" button
   - The app will list all available databases

3. **Select Database**
   - Click on any database card to view its collections

4. **Export Data**
   - **Single Collection**: Click "Export" button on any collection
   - **Multiple Collections**: Select checkboxes and click "Export Selected"
   - **Entire Database**: Click "Export All" to download all collections

5. **Download**
   - JSON files will be automatically downloaded to your device
   - Files are named with database, collection, and timestamp

## 🔒 Security Considerations

- **Connection strings are processed server-side** via Netlify Functions
- **No credentials are stored** - connections are temporary
- **CORS is configured** for secure API access
- **Always use secure connection strings** (mongodb+srv://) when possible
- **Never commit connection strings** to version control

## 🛠️ Technology Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Netlify Serverless Functions (Node.js)
- **Database**: MongoDB Node.js Driver
- **Deployment**: Netlify
- **Styling**: Custom CSS with modern design system

## 📁 Project Structure

```
MongoDB-Data-Exporter/
├── netlify/
│   └── functions/
│       ├── connect.js           # Database connection & listing
│       ├── list-collections.js  # Collection listing
│       └── export-data.js       # Data export
├── index.html                   # Main HTML file
├── styles.css                   # Premium CSS styling
├── app.js                       # Client-side JavaScript
├── netlify.toml                 # Netlify configuration
├── package.json                 # Dependencies
└── README.md                    # Documentation
```

## 🎨 Design Features

- **Dark Theme**: Easy on the eyes with vibrant accent colors
- **Glassmorphism**: Modern frosted glass effects
- **Smooth Animations**: Micro-interactions and transitions
- **Gradient Accents**: Dynamic color gradients
- **Responsive Design**: Mobile-first approach
- **Custom Scrollbars**: Themed scrollbar styling

## 🐛 Troubleshooting

### Connection Issues

- Verify your MongoDB URL is correct
- Check if your MongoDB instance allows remote connections
- For MongoDB Atlas, ensure your IP is whitelisted
- Verify username and password are correct

### Deployment Issues

- Ensure all dependencies are listed in `package.json`
- Check Netlify function logs for errors
- Verify `netlify.toml` configuration is correct

### Export Issues

- Large datasets may take time to export
- Check browser console for errors
- Ensure sufficient memory for large exports

## 📝 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For issues or questions, please open an issue on GitHub.

---

**Made with ❤️ for the MongoDB community**

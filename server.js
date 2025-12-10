const express = require('express');
const path = require('path');
const i18next = require('i18next');
const Backend = require('i18next-fs-backend');
const middleware = require('i18next-http-middleware');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static('public'));
i18next
    .use(Backend)
    .use(middleware.LanguageDetector)
    .init({
        fallbackLng: 'es',
        backend: {
            loadPath: path.join(__dirname, 'locales/{{lng}}/{{ns}}.json')
        },
        detection: {
            order: ['querystring', 'cookie', 'header'],
            caches: ['cookie']
        }
    });

app.use(middleware.handle(i18next));
app.use(express.static('public'));
app.use(express.json());

const projects = [
    {
        id: 1,
        name: '',
        description: '',
        tech: [],
        github: ''
    }
];

const skills = {
    languages: ['JavaScript', 'Python', 'SQL', 'Java'],
    backend: ['Node.js', 'Express', 'Django', 'FastAPI'],
    databases: ['phpMyAdmin', 'MongoDB', 'MySQL'],
    tools: [ 'Git', 'Linux']
};

const aboutMe = {
    name: 'Pedro Alejandro Ortiz Gilli',
    role: 'Backend Developer',
    location: 'Argentina',
    email: 'pedroortizgilli@hotmail.com',
    github: '',
    linkedin: ''
};

//Rutas API
app.get('/api/projects', (req, res) => {
    res.json(projects);
});

app.get('/api/projects/:id', (req, res) => {
    const project = projects.find(p => p.id === parseInt(req.params.id));
    if (!project) {
        return res.status(404).json({ error: 'Proyecto no encontrado' });
    }
    res.json(project);
});

app.get('/api/skills', (req, res) => {
    res.json(skills);
});

app.get('/api/about', (req, res) => {
    res.json(aboutMe);
});

//Comando especial para ejecutar "comandos"
app.post('/api/command', (req, res) => {
    const { command } = req.body;
  
    //Simulá comandos Linux
    if (command === 'whoami') {
        return res.json({ output: aboutMe.name });
    }
  
    if (command === 'pwd') {
        return res.json({ output: '/home/portfolio' });
    }
  
    if (command.startsWith('echo ')) {
        const text = command.substring(5);
        return res.json({ output: text });
    }
  
    res.status(400).json({ error: `comando no reconocido: ${command}` });
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
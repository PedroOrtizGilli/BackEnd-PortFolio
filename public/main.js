const output = document.getElementById('output');
const input = document.getElementById('commandInput');
let commandHistory = [];
let historyIndex = -1;

//Mensaje de bienvenida 
const intro = `
<pre class="ascii-art">
 ____          _             ___       _   _        ____ _ _ _ _ 
|  _ \\ ___  __| |_ __ ___   / _ \\ _ __| |_(_)____  / ___(_) | |_)
| |_) / _ \\/ _\` | '__/ _ \\ | | | | '__| __| |_  / | |  _| | | | |
|  __/  __/ (_| | | | (_) || |_| | |  | |_| |/ /  | |_| | | | | |
|_|   \\___|\\__,_|_|  \\___/  \\___/|_|   \\__|_/___|  \\____|_|_|_|_|
</pre>

<span style="color: #61dafb;">═══════════════════════════════════════════════════════════</span>
<br>
Bienvenido a mi Portfolio Terminal v1.0
<br>
Sistema operativo: <span style="color: #ffd93d;">Linux Backend Edition</span>
<br>
Escribí <span style="color: #ffd93d;">'help'</span> para ver los comandos disponibles.
<br>
<span style="color: #61dafb;">═══════════════════════════════════════════════════════════</span>
`;

addOutput('welcome', intro);

//Event listeners
input.addEventListener('keydown', async (e) => {
    if (e.key === 'Enter') {
        const command = input.value.trim();
        if (command) {
            commandHistory.push(command);
            historyIndex = commandHistory.length;
            addOutput('command', `<span class="prompt">guest@portfolio:~$</span> ${command}`);
            await executeCommand(command);
        }
        input.value = '';
    } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (historyIndex > 0) {
            historyIndex--;
            input.value = commandHistory[historyIndex];
        }
    } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (historyIndex < commandHistory.length - 1) {
            historyIndex++;
            input.value = commandHistory[historyIndex];
        } else {
            historyIndex = commandHistory.length;
            input.value = '';
        }
    } else if (e.key === 'Tab') {
        e.preventDefault();
        //Autocompletado simple
        const commands = ['help', 'ls', 'cat', 'skills', 'about', 'clear', 'whoami', 'pwd', 'neofetch'];
        const match = commands.find(cmd => cmd.startsWith(input.value));
        if (match) input.value = match;
    }
});

//Ejecutar comandos
async function executeCommand(cmd) {
    const parts = cmd.split(' ');
    const command = parts[0].toLowerCase();
    const args = parts.slice(1);

    switch(command) {
        case 'help':
            showHelp();
            break;
        case 'ls':
            if (args[0] === 'projects' || args[0] === '-projects') {
                await listProjects();
            } else {
                addOutput('info', `
                    <pre>
<span style="color: #61dafb;">drwxr-xr-x</span> 2 pedro pedro 4096 dic  9 12:07 <span style="color: #00ff41;">projects/</span>
<span style="color: #61dafb;">drwxr--r--</span> 1 pedro pedro  512 dic  9 12:59 about.txt
<span style="color: #61dafb;">drwxr--r--</span> 1 pedro pedro 1024 dic  9 13:40 README.md
                    </pre>
                `);
            }
            break;
        case 'cat':
            await catCommand(args[0]);
            break;
        case 'skills':
            await showSkills();
            break;
        case 'about':
            await showAbout();
            break;
        case 'clear':
            output.innerHTML = '';
            addOutput('welcome', intro);
            break;
        case 'whoami':
            await customCommand('whoami');
            break;
        case 'pwd':
            await customCommand('pwd');
            break;
        case 'echo':
            addOutput('info', args.join(' '));
            break;
        case 'fastfetch':
            showFastfetch();
            break;
        default:
            addOutput('error', `bash: ${command}: comando no encontrado`);
            addOutput('info', "Escribí <span style='color: #ffd93d;'>'help'</span> para ver comandos disponibles");
    }

    scrollToBottom();
}

//Mostrar ayuda
function showHelp() {
    addOutput('info', `
        <div class="section-title">COMANDOS DISPONIBLES</div>
        <div class="help-table">
            <div class="help-row"><span class="help-cmd">help</span><span>Muestra esta lista de comandos</span></div>
            <div class="help-row"><span class="help-cmd">ls [projects]</span><span>Lista archivos o proyectos</span></div>
            <div class="help-row"><span class="help-cmd">cat [archivo]</span><span>Muestra contenido de archivo</span></div>
            <div class="help-row"><span class="help-cmd">skills</span><span>Muestra stack tecnológico</span></div>
            <div class="help-row"><span class="help-cmd">about</span><span>Información de contacto</span></div>
            <div class="help-row"><span class="help-cmd">fastfetch</span><span>Información del sistema</span></div>
            <div class="help-row"><span class="help-cmd">clear</span><span>Limpia la terminal</span></div>
            <div class="help-row"><span class="help-cmd">whoami / pwd</span><span>Comandos Unix estándar</span></div>
        </div>

        <span style="color: #61dafb;">Tip:</span> Usá las flechas ↑↓ para navegar el historial de comandos
        <span style="color: #61dafb;">Tip:</span> Presioná Tab para autocompletar comandos
    `);
}

//Listar proyectos
async function listProjects() {
    try {
        const response = await fetch('/api/projects');
        const projects = await response.json();
        
        let html = '<div class="section-title">MIS PROYECTOS</div>';
        projects.forEach(p => {
            html += `
                <div class="project-item">
                    <div class="project-name">${p.name}</div>
                    <div class="project-desc">${p.description}</div>
                    <div class="project-tech">Stack: ${p.tech.join(' • ')}</div>
                    <div style="margin-top: 10px;"><span class="link" onclick="window.open('${p.github}')">🔗 ${p.github}</span></div>
                </div>
            `;
        });
        
        addOutput('info', html);
    } catch (error) {
        addOutput('error', 'Error al cargar proyectos. Verifica que el servidor esté corriendo.');
    }
}

//Mostrar skills
async function showSkills() {
    try {
        const response = await fetch('/api/skills');
        const skills = await response.json();
        
        let html = '<div class="section-title">STACK TECNOLÓGICO</div>';
        html += `<div style="margin: 15px 0;">`;
        html += `<div class="skill-category"><span class="skill-label">Lenguajes:</span> <span class="skill-items">${skills.languages.join(' • ')}</span></div>`;
        html += `<div class="skill-category"><span class="skill-label">Backend:</span> <span class="skill-items">${skills.backend.join(' • ')}</span></div>`;
        html += `<div class="skill-category"><span class="skill-label">Databases:</span> <span class="skill-items">${skills.databases.join(' • ')}</span></div>`;
        html += `<div class="skill-category"><span class="skill-label">Tools:</span> <span class="skill-items">${skills.tools.join(' • ')}</span></div>`;
        html += `</div>`;
        
        addOutput('info', html);
    } catch (error) {
        addOutput('error', 'Error al cargar skills');
    }
}

//Mostrar información personal
async function showAbout() {
    try {
        const response = await fetch('/api/about');
        const about = await response.json();
        
        let html = `
            <div class="section-title">SOBRE MÍ</div>
            <div style="margin: 15px 0;">
                <div class="skill-category">
                    <div style="margin-bottom: 8px;"><span class="skill-label">Nombre:</span> <span class="skill-items">${about.name}</span></div>
                    <div style="margin-bottom: 8px;"><span class="skill-label">Role:</span> <span class="skill-items">${about.role}</span></div>
                    <div style="margin-bottom: 8px;"><span class="skill-label">Ubicación:</span> <span class="skill-items">${about.location}</span></div>
                    <div style="margin-bottom: 8px;"><span class="skill-label">Email:</span> <span class="link">${about.email}</span></div>
                    <div style="margin-bottom: 8px;"><span class="skill-label">GitHub:</span> <span class="link" onclick="window.open('${about.github}')">${about.github}</span></div>
                    <div style="margin-bottom: 8px;"><span class="skill-label">LinkedIn:</span> <span class="link" onclick="window.open('${about.linkedin}')">${about.linkedin}</span></div>
                </div>
            </div>
        `;
        
        addOutput('info', html);
    } catch (error) {
        addOutput('error', 'Error al cargar información');
    }
}

//Comando neofetch
function showFastfetch() {
    addOutput('info', `
        <pre style="color: #00ff41; line-height: 1.4;">
            _,met$$$$$gg.          <span style="color: #61dafb;">guest</span>@<span style="color: #61dafb;">portfolio</span>
            ,g$$$$$$$$$$$$$$$P.       ────────────────────
        ,g$$P"     """Y$$.".        <span style="color: #ffd93d;">OS:</span> Backend Linux Edition
        ,$$P'              \`$$$.     <span style="color: #ffd93d;">Host:</span> Node.js Express Server
        ',$$P       ,ggs.     \`$$b:   <span style="color: #ffd93d;">Kernel:</span> JavaScript ES6+
        \`d$$'     ,$P"'   .    $$$    <span style="color: #ffd93d;">Uptime:</span> Always Online
        $$P      d$'     ,    $$P    <span style="color: #ffd93d;">Packages:</span> npm ecosystem
        $$:      $$.   -    ,d$$'    <span style="color: #ffd93d;">Shell:</span> terminal.js
        $$;      Y$b._   _,d$P'      <span style="color: #ffd93d;">Theme:</span> Matrix Green
        Y$$.    \`.\`"Y$$$$P"'         <span style="color: #ffd93d;">Terminal:</span> Custom HTML5
        \`$$b      "-.__              
        \`Y$$                        <span style="color: #00ff41;">██</span><span style="color: #ffd93d;">██</span><span style="color: #ff6b6b;">██</span><span style="color: #61dafb;">██</span><span style="color: #a8dadc;">██</span>
        \`Y$$.                      
            \`$$b.                    
            \`Y$$b.
                \`"Y$b._
                    \`"""
        </pre>
    `);
}

//Comando cat
async function catCommand(file) {
    if (file === 'about.txt') {
        await showAbout();
    } else if (file === 'README.md') {
        addOutput('info', `
<div class="section-title">README.md</div>

<pre style="color: #a8dadc; line-height: 1.6;">
# Portfolio Backend Developer

Este es mi portfolio interactivo en formato terminal Linux.
Diseñado para mostrar mis habilidades en desarrollo backend.

## Características

- Terminal interactiva y funcional
- API RESTful con Node.js + Express
- Comandos Unix simulados
- Diseño retro con efectos visuales
- Completamente responsive

## Uso

Escribí 'help' para ver todos los comandos disponibles.
Usá 'ls projects' para explorar mis proyectos.
Presioná Tab para autocompletar comandos.

## Stack

Backend: Node.js, Express
Frontend: HTML5, CSS3, Vanilla JS
Deployment: Render / Railway / Heroku

---
Creado con amor y mucho café
</pre>
        `);
    } else {
        addOutput('error', `cat: ${file}: No existe el archivo o directorio`);
    }
}

//Comandos personalizados (whoami, pwd)
async function customCommand(cmd) {
    try {
        const response = await fetch('/api/command', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ command: cmd })
        });
        const data = await response.json();
        
        if (data.output) {
            addOutput('info', data.output);
        } else if (data.error) {
            addOutput('error', data.error);
        }
    } catch (error) {
        addOutput('error', 'Error de conexión con el servidor');
    }
}

//Agregar output a la terminal
function addOutput(type, text) {
    const line = document.createElement('div');
    line.className = `line ${type}`;
    line.innerHTML = text;
    output.appendChild(line);
}

//Scroll al final
function scrollToBottom() {
    output.scrollTop = output.scrollHeight;
}

//Mantener el foco en el input
document.addEventListener('click', () => input.focus());
input.focus();

// ==========================================
// DATOS
// ==========================================
const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    backgroundColor: "#010D17",
    physics: {
        default: 'arcade',
        arcade: { debug: false }
    },
    scene: { preload, create, update }
};

const ESCENAS = ["cocina", "habitacion", "biblioteca", "sala"];
const TIEMPO_MAXIMO = 180; // 3 minutos en segundos
const TOTAL_GLOBOS = 5;
const TOTAL_OBJETOS_SEC = 10;

// ==========================================
// VARIABLES
// ==========================================
let jugador;
let teclas;
let globos;
let objetosSecundarios;
let sombra;
let tiempoRestante = TIEMPO_MAXIMO;
let globosRecolectados = 0;
let objetosSecundariosRecolectados = 0;
let textoTiempo;
let textoProgreso;

// ==========================================
// FUNCIONES
// ==========================================

// Cargar imágenes y sprites
function preload() {
    this.load.image('jugador', 'assets/jugador.png');
    this.load.image('globo', 'assets/globo.png');
    this.load.image('objSec', 'assets/objSec.png');
    this.load.image('sombra', 'assets/sombra.png');
}

// Crear la escena inicial
function create() {
    jugador = this.physics.add.sprite(400, 300, 'jugador').setCollideWorldBounds(true);
    sombra = this.physics.add.sprite(100, 100, 'sombra');

    globos = this.physics.add.group();
    objetosSecundarios = this.physics.add.group();

    generarGlobos(this);
    generarObjetosSecundarios(this);

    teclas = this.input.keyboard.createCursorKeys();
    teclaE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);

    textoTiempo = this.add.text(10, 10, "Tiempo: 3:00", { fontSize: "20px", fill: "#fff" });
    textoProgreso = this.add.text(10, 40, "Globos: 0/5  Objetos: 0/10", { fontSize: "20px", fill: "#fff" });

    this.physics.add.overlap(jugador, globos, recogerGlobo, null, this);
    this.physics.add.overlap(jugador, objetosSecundarios, recogerObjetoSec, null, this);
    this.physics.add.overlap(jugador, sombra, finalMalo, null, this);
}

// Generar globos en posiciones aleatorias
function generarGlobos(scene) {
    for (let i = 0; i < TOTAL_GLOBOS; i++) {
        let globo = globos.create(Phaser.Math.Between(50, 750), Phaser.Math.Between(50, 550), 'globo');
        globo.setImmovable(true);
    }
}

// Generar objetos secundarios en mesas
function generarObjetosSecundarios(scene) {
    for (let i = 0; i < TOTAL_OBJETOS_SEC; i++) {
        let obj = objetosSecundarios.create(Phaser.Math.Between(50, 750), Phaser.Math.Between(50, 550), 'objSec');
        obj.setImmovable(true);
    }
}

// Recoger un globo
function recogerGlobo(jugador, globo) {
    globo.destroy();
    globosRecolectados++;
    actualizarTexto();
}

// Recoger un objeto secundario
function recogerObjetoSec(jugador, objeto) {
    if (Phaser.Input.Keyboard.JustDown(teclaE)) {
        objeto.destroy();
        objetosSecundariosRecolectados++;
        actualizarTexto();
    }
}

// Actualizar texto HUD
function actualizarTexto() {
    textoProgreso.setText(`Globos: ${globosRecolectados}/5  Objetos: ${objetosSecundariosRecolectados}/10`);
}

// Final malo: sombra toca jugador
function finalMalo() {
    this.scene.pause();
    this.add.text(200, 300, "😭 Milan fue atrapado...", { fontSize: "40px", fill: "#fff" });
}

// Finales buenos o malos según objetos
function verificarFinal() {
    if (globosRecolectados === TOTAL_GLOBOS) {
        if (objetosSecundariosRecolectados === TOTAL_OBJETOS_SEC) {
            this.add.text(150, 300, "🎉 5 niños fueron a tu fiesta!", { fontSize: "40px", fill: "#fff" });
        } else {
            this.add.text(100, 300, "😢 Nadie fue a tu fiesta...", { fontSize: "40px", fill: "#fff" });
        }
        this.scene.pause();
    }
}

// ==========================================
// LÓGICA (update loop)
// ==========================================
function update(time, delta) {
    jugador.setVelocity(0);

    if (teclas.left.isDown) jugador.setVelocityX(-200);
    if (teclas.right.isDown) jugador.setVelocityX(200);

    // Movimiento de sombra hacia jugador
    this.physics.moveToObject(sombra, jugador, 100);

    // Tiempo
    tiempoRestante -= delta / 1000;
    if (tiempoRestante <= 0) {
        tiempoRestante = 0;
        verificarFinal.call(this);
    }
    let minutos = Math.floor(tiempoRestante / 60);
    let segundos = Math.floor(tiempoRestante % 60);
    textoTiempo.setText(`Tiempo: ${minutos}:${segundos.toString().padStart(2, '0')}`);
}

// ==========================================
// INICIAR JUEGO
// ==========================================
new Phaser.Game(config);

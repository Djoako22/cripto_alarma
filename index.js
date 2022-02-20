const sonido_alarma = new Audio("alarma.mp3");

let criptos;

(async () => {
    const res = await fetch("https://api.pancakeswap.info/api/v2/tokens");
    const { data } = await res.json();
    criptos = Object.entries(data);
})();

const form = document.querySelector("form");
const cripto = document.querySelector(".cripto");
const precio = document.querySelector(".precio");
const opciones = document.querySelector(".opciones");
const p_actual = document.querySelector(".p_actual");
const p_alarma = document.querySelector(".p_alarma");
let n_actual, n_alarma;
let reset_time1, reset_time2;

cripto.addEventListener("input", () => {
    opciones.innerHTML = "";
    opciones.style.visibility = "hidden";
    if (cripto.value.length >= 3) {
        opciones.style.visibility = "visible";
        const criptos_filtradas = criptos.filter(
            (c) =>
                c[0].includes(cripto.value) ||
                c[1].name.toLowerCase().includes(cripto.value.toLowerCase()) ||
                c[1].symbol.toLowerCase().includes(cripto.value.toLowerCase())
        );
        criptos_filtradas.forEach((c) => {
            opciones.innerHTML += `
                    <div class="opcion" onclick='seleccionar(${JSON.stringify(
                        c
                    )})'>${c[1].symbol}</div>
                    `;
        });
    }
});

function seleccionar(c) {
    clearInterval(reset_time1);
    cripto.value = c[1].symbol;
    n_actual =
        c[1].price > 1000
            ? Number(c[1].price).toFixed(0)
            : Number(c[1].price).toFixed(5);
    p_actual.innerHTML = "Precio Actual: " + n_actual;
    opciones.innerHTML = "";
    reset_time1 = setInterval(async () => {
        const res = await fetch(
            "https://api.pancakeswap.info/api/v2/tokens/" + c[0]
        );
        const { data } = await res.json();
        n_actual =
            data.price > 1000
                ? Number(data.price).toFixed(0)
                : Number(data.price).toFixed(5);
        p_actual.innerHTML = "Precio Actual: " + n_actual;
    }, 10000);
}

form.addEventListener("submit", establecerAlarma);

function establecerAlarma(e) {
    e.preventDefault();
    n_alarma = precio.value;
    p_alarma.innerHTML = "Precio Alarma: " + n_alarma;
    if (n_actual && n_alarma) {
        if (n_actual > n_alarma) {
            // si el p actual es mayor que p alarma
            // esperar a que pase lo contrario y terminar intervalo
            reset_time2 = setInterval(() => {
                if (n_actual <= n_alarma) {
                    sonido_alarma.play();
                    p_alarma.innerHTML += "<br>Toco precio!";
                    clearInterval(reset_time2);
                }
            }, 1000);
        }
        if (n_actual < n_alarma) {
            // si el p actual es menor que p alarma
            // esperar a que pase lo contrario y terminar intervalo
            reset_time2 = setInterval(() => {
                if (n_actual >= n_alarma) {
                    sonido_alarma.play();
                    p_alarma.innerHTML += "<br>Toco precio!";
                    clearInterval(reset_time2);
                }
            }, 1000);
        }
    }
}

function restablecer() {
    clearInterval(reset_time1);
    clearInterval(reset_time2);
    cripto.value = precio.value = p_actual.innerHTML = p_alarma.innerHTML = "";
    n_actual = n_alarma = null;
}

window.addEventListener("DOMContentLoaded", () => {
    const clock = new BouncyBlockClock(".clock");
});

class BouncyBlockClock {
    constructor(qs) {
        this.el = document.querySelector(qs);
        this.dateEl = document.getElementById('current-date');
        this.time = { a: [], b: [] };
        this.rollClass = "clock__block--bounce";
        this.digitsTimeout = null;
        this.rollTimeout = null;
        this.mod = 0 * 60 * 1000;
        this._lastMinute = -1; // Zmienna do śledzenia zmian minuty

        // Od razu aktualizujemy datę
        this.updateDate();

        this.loop();
    }

    // Metoda do aktualizacji daty
    updateDate() {
        const date = new Date();
        const dzień = date.getDate();
        const miesiące = [
            "stycznia", "lutego", "marca", "kwietnia", "maja", "czerwca",
            "lipca", "sierpnia", "września", "października", "listopada", "grudnia"
        ];
        const miesiąc = miesiące[date.getMonth()];
        const rok = date.getFullYear();
        const dniTygodnia = [
            "Niedziela", "Poniedziałek", "Wtorek", "Środa",
            "Czwartek", "Piątek", "Sobota"
        ];
        const dzieńTygodnia = dniTygodnia[date.getDay()];

        this.dateEl.textContent = `${dzieńTygodnia}, ${dzień} ${miesiąc} ${rok}`;
    }

    animateDigits() {
        const groups = this.el.querySelectorAll("[data-time-group]");

        Array.from(groups).forEach((group, i) => {
            const { a, b } = this.time;

            if (a[i] !== b[i]) group.classList.add(this.rollClass);
        });

        clearTimeout(this.rollTimeout);
        this.rollTimeout = setTimeout(this.removeAnimations.bind(this), 900);
    }

    displayTime() {
        // screen reader time
        const timeDigits = [...this.time.b];
        const ap = timeDigits.pop();

        this.el.ariaLabel = `${timeDigits.join(":")} ${ap}`;

        // displayed time
        Object.keys(this.time).forEach(letter => {
            const letterEls = this.el.querySelectorAll(`[data-time="${letter}"]`);

            Array.from(letterEls).forEach((el, i) => {
                el.textContent = this.time[letter][i];
            });
        });
    }

    loop() {
        this.updateTime();
        this.displayTime();
        this.animateDigits();

        // Sprawdzamy, czy minuta się zmieniła, i jeśli tak, aktualizujemy datę
        const currentMinute = new Date().getMinutes();
        if (this._lastMinute !== currentMinute) {
            this.updateDate();
            this._lastMinute = currentMinute;
        }

        this.tick();
    }

    removeAnimations() {
        const groups = this.el.querySelectorAll("[data-time-group]");

        Array.from(groups).forEach(group => {
            group.classList.remove(this.rollClass);
        });
    }

    tick() {
        clearTimeout(this.digitsTimeout);
        this.digitsTimeout = setTimeout(this.loop.bind(this), 1000);
    }

    updateTime() {
        const rawDate = new Date();
        const date = new Date(Math.ceil(rawDate.getTime() / 1000) * 1000 + this.mod);
        let h = date.getHours();
        const m = date.getMinutes();
        const s = date.getSeconds();
        const ap = h < 12 ? "AM" : "PM";

        if (h === 0) h = 12;
        if (h > 12) h -= 12;

        this.time.a = [...this.time.b];
        this.time.b = [
            (h < 10 ? `0${h}` : `${h}`),
            (m < 10 ? `0${m}` : `${m}`),
            (s < 10 ? `0${s}` : `${s}`),
            ap
        ];

        if (!this.time.a.length) this.time.a = [...this.time.b];
    }
}

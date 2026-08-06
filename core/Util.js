
const splashes = [
    "As seen on TV!", "Awesome!", "100% pure!", "May contain nuts!", "Better than Prey!",
    "More polygons!", "Sexy!", "Limited edition!", "Flashing letters!", "Made by Notch!",
    "It's here!", "Best in class!", "It's finished!", "Kind of dragon free!", "Excitement!",
    "More than 500 sold!", "One of a kind!", "Heaps of hits on YouTube!", "Indev!",
    "Spiders everywhere!", "Check it out!", "Holy cow, man!", "It's a game!", "Made in Sweden!",
    "Uses LWJGL!", "Reticulating splines!", "Minecraft!", "Yaaay!", "Singleplayer!",
    "Keyboard compatible!", "Undocumented!", "Ingots!", "Exploding creepers!", "That's no moon!",
    "l33t!", "Create!", "Survive!", "Dungeon!", "Exclusive!", "The bee's knees!", "Down with O.P.P.!",
    "Closed source!", "Classy!", "Wow!", "Not on steam!", "Oh man!", "Awesome community!",
    "Pixels!", "Teetsuuuuoooo!", "Kaaneeeedaaaa!", "Now with difficulty!", "Enhanced!",
    "90% bug free!", "Pretty!", "12 herbs and spices!", "Fat free!", "Absolutely no memes!",
    "Free dental!", "Ask your doctor!", "Minors welcome!", "Cloud computing!", "Legal in Finland!",
    "Hard to label!", "Technically good!", "Bringing home the bacon!", "Indie!", "GOTY!",
    "Ceci n'est pas une title screen!", "Euclidian!", "Now in 3D!", "Inspirational!", "Herregud!",
    "Complex cellular automata!", "Yes, sir!", "Played by cowboys!", "OpenGL 1.2!", "Thousands of colors!",
    "Try it!", "Age of Wonders is better!", "Try the mushroom stew!", "Sensational!", "Hot tamale, hot hot tamale!",
    "Play him off, keyboard cat!", "Guaranteed!", "Macroscopic!", "Bring it on!", "Random splash!",
    "Call your mother!", "Monster infighting!", "Loved by millions!", "Ultimate edition!",
    "Freaky!", "You've got a brand new key!", "Water proof!", "Uninflammable!", "Whoa, dude!",
    "All inclusive!", "Tell your friends!", "NP is not in P!", "Notch <3 ez!", "Music by C418!",
    "Livestreamed!", "Haunted!", "Polynomial!", "Terrestrial!", "All is full of love!", "Full of stars!",
    "Scientific!", "Cooler than Spock!", "Collaborate and listen!", "Never dig down!",
    "Take frequent breaks!", "Not linear!", "Han shot first!", "Nice to meet you!", "Buckets of lava!",
    "Ride the pig!", "Larger than Earth!", "sqrt(-1) love you!", "Phobos anomaly!", "Punching wood!",
    "Falling off cliffs!", "0% sugar!", "150% hyperbole!", "Synecdoche!", "Let's danec!",
    "Seecret Friday update!", "Reference implementation!", "Lewd with two dudes with food!",
    "Kiss the sky!", "20 GOTO 10!", "Verlet intregration!", "Peter Griffin!", "Do not distribute!",
    "Cogito ergo sum!", "4815162342 lines of code!", "A skeleton popped out!", "The Work of Notch!",
    "The sum of its parts!", "BTAF used to be good!", "I miss ADOM!", "umop-apisdn!", "OICU812!",
    "Bring me Ray Cokes!", "Finger-licking!", "Thematic!", "Pneumatic!", "Sublime!",
    "Octagonal!", "Une baguette!", "Gargamel plays it!", "Rita is the new top dog!",
    "SWM forever!", "Representing Edsbyn!", "Matt Damon!", "Supercalifragilisticexpialidocious!",
    "Consummate V's!", "Cow Tools!", "Double buffered!", "Fan fiction!", "Flaxkikare!",
    "Jason! Jason! Jason!", "Hotter than the sun!", "Internet enabled!", "Autonomous!",
    "Engage!", "Fantasy!", "DRR! DRR! DRR!", "Kick it root down!", "Regional resources!",
    "Woo, facepunch!", "Woo, somethingawful!", "Woo, /v/!", "Woo, tigsource!", "Woo, minecraftforum!",
    "Woo, worldofminecraft!", "Woo, reddit!", "Woo, 2pp!", "Google anlyticsed!", "Now supports åäö!",
    "Give us Gordon!", "Tip your waiter!", "Very fun!", "12345 is a bad password!",
    "Vote for net neutrality!", "Lives in a pineapple under the sea!", "MAP11 has two names!",
    "Omnipotent!", "Gasp!", "...!", "Bees, bees, bees, bees!", "Jag känner en bot!",
    "This text is hard to read if you play the game at the default resolution, but at 1080p it's fine!",
    "Haha, LOL!", "Hampsterdance!", "Switches and ores!", "Menger sponge!", "idspispopd!",
    "Eple (original edit)!", "So fresh, so clean!", "Slow acting portals!", "Try the Nether!",
    "Don't look directly at the bugs!", "Oh, ok, Pigmen!", "Finally with ladders!",
    "Scary!", "Play Minecraft, Watch Topgear, Get Pig!", "Twittered about!", "Jump up, jump up, and get down!",
    "Joel is neat!", "A riddle, wrapped in a mystery!", "Huge tracts of land!", "Welcome to your Doom!",
    "Stay a while, stay forever!", "Stay a while and listen!", "Treatment for your rash!",
    "\"Autological\" is!", "Information wants to be free!", "\"Almost never\" is an interesting concept!",
    "Lots of truthiness!", "The creeper is a spy!", "Turing complete!", "It's groundbreaking!",
    "Let our battle's begin!", "The sky is the limit!", "Jeb has amazing hair!", "Casual gaming!",
    "Undefeated!", "Kinda like Lemmings!", "Follow the train, CJ!", "Leveraging synergy!",
    "This message will never appear on the splash screen, isn't that weird?", "DungeonQuest is unfair!",
    "110813!", "90210!", "Check out the far lands!", "Tyrion would love it!", "Also try VVVVVV!",
    "Also try Super Meat Boy!", "Also try Terraria!", "Also try Mount And Blade!", "Also try Project Zomboid!",
    "Also try World of Goo!", "Also try Limbo!", "Also try Pixeljunk Shooter!", "Also try Braid!",
    "That's super!", "Bread is pain!", "Read more books!", "Khaaaaaaaaan!", "Less addictive than TV Tropes!",
    "More addictive than lemonade!", "Bigger than a bread box!", "Millions of peaches!", "Fnord!",
    "This is my true form!", "Totally forgot about Dre!", "Don't bother with the clones!", "Pumpkinhead!",
    "Hobo humping slobo babe!", "Made by Jeb!", "Has an ending!", "Finally complete!", "Feature packed!",
    "Boots with the fur!", "Stop, hammertime!", "Testificates!", "Conventional!", "Homeomorphic to a 3-sphere!",
    "Doesn't avoid double negatives!", "Place ALL the blocks!", "Does barrel rolls!", "Meeting expectations!",
    "PC gaming since 1873!", "Ghoughpteighbteau tchoghs!", "Déjà vu!", "Déjà vu!", "Got your nose!",
    "Haley loves Elan!", "Afraid of the big, black bat!", "Doesn't use the U-word!", "Child's play!",
    "See you next Friday or so!", "From the streets of Södermalm!", "150 bpm for 400000 minutes!",
    "Technologic!", "Funk soul brother!", "Pumpa kungen!"
];








export const getRandomSplash = () => {
    const today = new Date();
    const month = today.getMonth() + 1;
    const day = today.getDate();

    if (month === 11 && day === 9) {
        return "Happy birthday, ez!";
    }
    if (month === 6 && day === 1) {
        return "Happy birthday, Notch!";
    }
    if (month === 12 && day === 24) {
        return "Merry X-mas!";
    }
    if (month === 1 && day === 1) {
        return "Happy new year!";
    }

    return splashes[Math.floor(Math.random() * splashes.length)];
}











export class Vec3 {
    constructor(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    interpolateTo(vec, p) {
        const xt = this.x + (vec.x - this.x) * p;
        const yt = this.y + (vec.y - this.y) * p;
        const zt = this.z + (vec.z - this.z) * p;
        return new Vec3(xt, yt, zt)
    }

    set(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
}










export class AABB {
    constructor(x0, y0, z0, x1, y1, z1) {
        this.epsilon = 0.001;
        this.x0 = x0;
        this.y0 = y0;
        this.z0 = z0;
        this.x1 = x1;
        this.y1 = y1;
        this.z1 = z1;
    }

    expand(xa, ya, za) {
        let _x0 = this.x0;
        let _y0 = this.y0;
        let _z0 = this.z0;
        let _x1 = this.x1;
        let _y1 = this.y1;
        let _z1 = this.z1;

        if (xa < 0.0) _x0 += xa;
        if (xa > 0.0) _x1 += xa;
        if (ya < 0.0) _y0 += ya;
        if (ya > 0.0) _y1 += ya;
        if (za < 0.0) _z0 += za;
        if (za > 0.0) _z1 += za;

        return new AABB(_x0, _y0, _z0, _x1, _y1, _z1);
    }

    grow(xa, ya, za) {
        return new AABB(
            this.x0 - xa, this.y0 - ya, this.z0 - za,
            this.x1 + xa, this.y1 + ya, this.z1 + za
        );
    }

    cloneMove(xa, ya, za) {
        return new AABB(this.x0 + xa, this.y0 + ya, this.z0 + za, this.x1 + xa, this.y1 + ya, this.z1 + za);
    }

    clipXCollide(c, xa) {
        if (c.y1 <= this.y0 || c.y0 >= this.y1) return xa;
        if (c.z1 <= this.z0 || c.z0 >= this.z1) return xa;

        if (xa > 0.0 && c.x1 <= this.x0) {
            let max = this.x0 - c.x1 - this.epsilon;
            if (max < xa) xa = max;
        }
        if (xa < 0.0 && c.x0 >= this.x1) {
            let max = this.x1 - c.x0 + this.epsilon;
            if (max > xa) xa = max;
        }
        return xa;
    }

    clipYCollide(c, ya) {
        if (c.x1 <= this.x0 || c.x0 >= this.x1) return ya;
        if (c.z1 <= this.z0 || c.z0 >= this.z1) return ya;

        if (ya > 0.0 && c.y1 <= this.y0) {
            let max = this.y0 - c.y1 - this.epsilon;
            if (max < ya) ya = max;
        }
        if (ya < 0.0 && c.y0 >= this.y1) {
            let max = this.y1 - c.y0 + this.epsilon;
            if (max > ya) ya = max;
        }
        return ya;
    }

    clipZCollide(c, za) {
        if (c.x1 <= this.x0 || c.x0 >= this.x1) return za;
        if (c.y1 <= this.y0 || c.y0 >= this.y1) return za;

        if (za > 0.0 && c.z1 <= this.z0) {
            let max = this.z0 - c.z1 - this.epsilon;
            if (max < za) za = max;
        }
        if (za < 0.0 && c.z0 >= this.z1) {
            let max = this.z1 - c.z0 + this.epsilon;
            if (max > za) za = max;
        }
        return za;
    }

    intersects(c) {
        if (c.x1 <= this.x0 || c.x0 >= this.x1) return false;
        if (c.y1 <= this.y0 || c.y0 >= this.y1) return false;
        return !(c.z1 <= this.z0) && !(c.z0 >= this.z1);
    }

    move(xa, ya, za) {
        this.x0 += xa;
        this.y0 += ya;
        this.z0 += za;
        this.x1 += xa;
        this.y1 += ya;
        this.z1 += za;
    }
}









export class JavaRandom {
    static p2_16 = 0x10000;
    static p2_24 = 0x1000000;
    static p2_27 = 0x8000000;
    static p2_31 = 0x80000000;
    static p2_32 = 0x100000000;
    static p2_48 = 0x1000000000000;
    static p2_53 = Math.pow(2, 53);
    static m2_16 = 0xffff;
    static c2 = 0x0005;
    static c1 = 0xdeec;
    static c0 = 0xe66d;

    constructor(seedval) {
        this.s2 = 0; this.s1 = 0; this.s0 = 0;
        this.nextNextGaussian = 0;
        this.haveNextNextGaussian = false;

        if (seedval === undefined) {
            seedval = Math.floor(Math.random() * JavaRandom.p2_48);
        }
        this.setSeed(seedval);
    }

    _next() {
        let carry = 0xb;
        let r0 = (this.s0 * JavaRandom.c0) + carry;
        carry = r0 >>> 16;
        r0 &= JavaRandom.m2_16;
        let r1 = (this.s1 * JavaRandom.c0 + this.s0 * JavaRandom.c1) + carry;
        carry = r1 >>> 16;
        r1 &= JavaRandom.m2_16;
        let r2 = (this.s2 * JavaRandom.c0 + this.s1 * JavaRandom.c1 + this.s0 * JavaRandom.c2) + carry;
        r2 &= JavaRandom.m2_16;

        this.s2 = r2; this.s1 = r1; this.s0 = r0;
        return (r2 << 16) | r1;
    }

    next(bits) { return this._next() >>> (32 - bits); }
    next_signed(bits) { return this._next() >> (32 - bits); }

    setSeed(n) {
        let bSeed = (BigInt(n) ^ 0x5DEECE66Dn) & ((1n << 48n) - 1n);

        this.s0 = Number(bSeed & 0xFFFFn);
        this.s1 = Number((bSeed >> 16n) & 0xFFFFn);
        this.s2 = Number((bSeed >> 32n) & 0xFFFFn);

        this.haveNextNextGaussian = false;
    }

    nextInt(bound) {
        if (bound === undefined) return this.next_signed(32);
        if (bound <= 0) throw new RangeError("bound must be positive");

        if ((bound & -bound) === bound) {
            return Number((BigInt(bound) * BigInt(this.next(31))) >> 31n);
        }

        let bits, val;
        do {
            bits = this.next(31);
            val = bits % bound;
        } while (bits - val + (bound - 1) < 0);
        return val;
    }

    nextBoolean() { return this.next(1) !== 0; }
    nextFloat() { return this.next(24) / JavaRandom.p2_24; }
    nextDouble() { return (JavaRandom.p2_27 * this.next(26) + this.next(27)) / JavaRandom.p2_53; }
}












export const createOverlayGradient = (width, height) => {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");

    const whiteGrad = ctx.createLinearGradient(0, 0, 0, height);
    whiteGrad.addColorStop(0, "rgba(255, 255, 255, 0.5)");
    whiteGrad.addColorStop(1, "rgba(255, 255, 255, 1.0)");
    ctx.fillStyle = whiteGrad;
    ctx.fillRect(0, 0, width, height);

    const darkGrad = ctx.createLinearGradient(0, 0, 0, height);
    darkGrad.addColorStop(0, "rgba(0, 0, 0, 0.0)");
    darkGrad.addColorStop(1, "rgba(0, 0, 0, 0.5)");
    ctx.fillStyle = darkGrad;
    ctx.fillRect(0, 0, width, height);

    return canvas;
}








export const Enum = {
    "AssetType": {
        "None": 0,
        "Texture": 1,
        "Audio": 2,
        "Model": 3,
        "HDR": 4
    },
    "TextStyle": {
        "Left": 0,
        "Right": 1,
        "Centered": 2,
    },
    "RenderState": {
        "Clear": 0,
        "MenuBackground": 1,
        "InGame": 2
    },
    "CursorType": {
        "Pointer": "pointer",
        "Default": "default",
        "Crosshair": "crosshair",
        "Grab": "grab",
        "None": "none"
    },
    "Color": {
        "SelectButtonColor": 0xF7FF88,
        "NormalButtonColor": 0xFFFFFF,
        "SelectTextColor": 0xFAFA00,
    },
    "Difficulty": {
        "Peaceful": 0,
        "Easy": 1,
        "Normal": 2,
        "Hard": 3
    },
    "Graphics": {
        "Fast": 0,
        "Fancy": 1
    },
    "RenderDistance": {
        "Tiny": 2,
        "Short": 4,
        "Normal": 8,
        "Far": 16
    },
    "Performance": {
        "PowerSaver": 0,
        "Balanced": 1,
        "MaxFPS": 2,
    },
    "GUIScale": {
        "Auto": 0,
        "Small": 1,
        "Normal": 2,
        "Large": 3
    },
    "Particles": {
        "Minimal": 0,
        "Decreased": 1,
        "All": 2,
    },
    "Controls": {
        "Q": "KeyQ",
        "W": "KeyW",
        "E": "KeyE",
        "R": "KeyR",
        "T": "KeyT",
        "Y": "KeyY",
        "U": "KeyU",
        "I": "KeyI",
        "O": "KeyO",
        "P": "KeyP",
        "A": "KeyA",
        "S": "KeyS",
        "D": "KeyD",
        "F": "KeyF",
        "G": "KeyG",
        "H": "KeyH",
        "J": "KeyJ",
        "K": "KeyK",
        "L": "KeyL",
        "Z": "KeyZ",
        "X": "KeyX",
        "C": "KeyC",
        "V": "KeyV",
        "B": "KeyB",
        "N": "KeyN",
        "M": "KeyM",
        "SPACE": "Space",
        "BACKSPACE": "Backspace",
        "ENTER": "Enter",
        "LSHIFT": "LeftShift",
        "RSHIFT": "RightShift",
        "LCONTROL": "LeftControl",
        "RCONTROL": "RightControl",
        "ESCAPE": "Esc",
        "TAB": "Tab",
        "Button1": "Mouse_Button_0",
        "Button2": "Mouse_Button_2",
        "Button3": "Mouse_Button_1",
    }
}








export class EventList {
    constructor() {
        this.events = new Map();
        this.nextID = 0;
    }

    addEvent(event, eventID = this.nextID++) {
        this.events.set(eventID, event);
        return eventID
    }

    runEvent(eventID, arg = null) {
        const event = this.events.get(eventID);

        if (event) {
            event(arg);
        }
    }

    runAll(arg = null) {
        for (const event of this.events.values()) {
            event(arg);
        }
    }

    removeEvent(eventID) {
        this.events.delete(eventID);
    }

    clear() {
        this.events.clear();
    }
}
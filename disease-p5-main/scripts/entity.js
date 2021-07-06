class Entity {
    constructor(x, y, state) {
        // Misc
        this.state = state;

        // Physics
        this.pos = createVector(x, y);
        this.vel = p5.Vector.fromAngle(radians(random(360)), 25);
        this.acc = createVector();
        this.accAmt = 1;
        this.maxSpeed = 3;
    }

    act() {
        //this.wander();
        this.update();
        if (this.state === 2) this.infect();
        this.bounce();
    }

    // Bounce off walls
    bounce() {
        if (this.pos.x - E_RADIUS < 0) {
            this.pos.x = E_RADIUS;
            this.vel.x *= -1;
        }
        if (this.pos.x + E_RADIUS > width) {
            this.pos.x = width - E_RADIUS;
            this.vel.x *= -1;
        }
        if (this.pos.y - E_RADIUS < 0) {
            this.pos.y = E_RADIUS;
            this.vel.y *= -1;
        }
        if (this.pos.y + E_RADIUS > height) {
            this.pos.y = height - E_RADIUS;
            this.vel.y *= -1;
        }
    }

    draw() {
        noStroke();
        ellipseMode(RADIUS);
        if (showRadius) {
            fill(255, 255, 255, 31);
            ellipse(this.pos.x, this.pos.y, I_RADIUS, I_RADIUS);
        }
        fill(COLORS[this.state]);
        ellipse(this.pos.x, this.pos.y, E_RADIUS, E_RADIUS);
    }

    // Infect nearby entities
    infect() {
        // Find all entities within spread range and infect
        for (let i = 0; i < entities.length; i++) {
            let e = entities[i];
			if(e.state === 0)
			{
				if (inCircle(e.pos.x, e.pos.y, this.pos.x, this.pos.y, I_RADIUS)) {
					e.state = stateTransition(0, 1);
				}
			}
        }
    }

    update() {
        // Update position, etc.
        this.vel.add(this.acc);
        this.vel.limit(this.maxSpeed);
        this.pos.add(this.vel);

        // State transitions
		
		// Progression transitions
        if (this.state !== statesEnum.SUSCEPTIBLE) {
			if(this.state === statesEnum.INFECTIOUS)
			{
				//Recovery
				this.state = stateTransition(statesEnum.INFECTIOUS, statesEnum.REMOVED_P);
				if(this.state === statesEnum.REMOVED_P)
				{
					this.state = stateTransition(statesEnum.REMOVED_P, statesEnum.REMOVED_N);
				}
			}
			else
			{
				this.state = stateTransition(this.state, this.state+1);
			}
        }
		// Vaccination transition
		if (this.state === statesEnum.SUSCEPTIBLE) {
			this.state = stateTransition(0, 4);
		}
		
    }

    // Wander randomly around the map
    wander() {
        this.acc = p5.Vector.random2D().mult(this.accAmt);
    }
}

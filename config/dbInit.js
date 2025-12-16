const db = require('./db');
const bcrypt = require('bcryptjs');

const SALT_ROUNDS = 10;

const departments = [
    'Asuntos_Sociales',
    'Cultura',
    'Deportes',
    'Prensa_Comunicaciones',
    'Agricultura',
    'Participación_Ciudadana',
    'Alcaldía',
    'Jurídico',
    'Admin',
    'Superadmin'
];

async function initDatabase() {
    const dbType = process.env.DB_TYPE;

    if (dbType === 'mysql') {
        const pool = db.rawPool;

        await pool.execute(`
            CREATE TABLE IF NOT EXISTS department (
              id INT PRIMARY KEY,
              name VARCHAR(255) NOT NULL UNIQUE
            )
        `);

        await pool.execute(`
            CREATE TABLE IF NOT EXISTS travel (
              id INT AUTO_INCREMENT PRIMARY KEY,
              descriptor VARCHAR(255) NOT NULL,
              seats_occupied INT NOT NULL,
              seats_total INT NOT NULL,
              department INT NOT NULL,
              bus VARCHAR(255) NOT NULL,
              FOREIGN KEY (department) REFERENCES department(id)
                ON DELETE CASCADE
                ON UPDATE CASCADE,
              UNIQUE KEY unique_descriptor_bus (descriptor, bus)
            )
        `);

        await pool.execute(`
            CREATE TABLE IF NOT EXISTS traveller (
              id INT AUTO_INCREMENT PRIMARY KEY,
              dni VARCHAR(255) NOT NULL UNIQUE,
              name VARCHAR(255) NOT NULL,
              signup VARCHAR(255) NOT NULL,
              phone VARCHAR(255) NOT NULL,
              trip INT NOT NULL,
              department INT NOT NULL,
              version INT NOT NULL DEFAULT 0,
              FOREIGN KEY (department) REFERENCES department(id)
                ON DELETE CASCADE
                ON UPDATE CASCADE,
              FOREIGN KEY (trip) REFERENCES travel(id)
                ON DELETE CASCADE
                ON UPDATE CASCADE
            )
        `);

        await pool.execute(`
            CREATE TABLE IF NOT EXISTS worker (
              id INT AUTO_INCREMENT PRIMARY KEY,
              username VARCHAR(255) NOT NULL UNIQUE,
              password VARCHAR(255) NOT NULL,
              department INT NOT NULL,
              FOREIGN KEY (department) REFERENCES department(id)
                ON DELETE CASCADE
                ON UPDATE CASCADE
            )
        `);

        // Triggers para evitar que seats_occupied supere a seats_total

        // BEFORE INSERT → validar que haya asientos
        await pool.execute(`DROP TRIGGER IF EXISTS traveller_before_insert`);
        await pool.execute(`
            CREATE TRIGGER traveller_before_insert
            BEFORE INSERT ON traveller
            FOR EACH ROW
            BEGIN
                DECLARE total INT;
                DECLARE ocupados INT;

                SELECT seats_total, seats_occupied
                 INTO total, ocupados
                 FROM travel
                 WHERE id = NEW.trip;

                IF ocupados >= total THEN
                 SIGNAL SQLSTATE '45000'
                 SET MESSAGE_TEXT = 'No hay asientos disponibles en este viaje';
                END IF;
            END
        `);

        // AFTER INSERT → sumar asiento
        await pool.execute(`DROP TRIGGER IF EXISTS traveller_after_insert`);
        await pool.execute(`
            CREATE TRIGGER traveller_after_insert
            AFTER INSERT ON traveller
            FOR EACH ROW
            BEGIN
                UPDATE travel
                SET seats_occupied = seats_occupied + 1
                WHERE id = NEW.trip;
            END
        `);

        // BEFORE UPDATE → validar cambio de viaje
        await pool.execute(`DROP TRIGGER IF EXISTS traveller_before_update`);
        await pool.execute(`
            CREATE TRIGGER traveller_before_update
            BEFORE UPDATE ON traveller
            FOR EACH ROW
            BEGIN
                DECLARE total INT;
                DECLARE ocupados INT;

                IF OLD.trip != NEW.trip THEN
                 SELECT seats_total, seats_occupied
                  INTO total, ocupados
                  FROM travel
                  WHERE id = NEW.trip;

                    IF ocupados >= total THEN
                     SIGNAL SQLSTATE '45000'
                     SET MESSAGE_TEXT = 'No hay asientos disponibles en el nuevo viaje';
                    END IF;
               END IF;
            END
        `);

        // AFTER UPDATE → ajustar asientos si cambió de viaje
        await pool.execute(`DROP TRIGGER IF EXISTS traveller_after_update`);
        await pool.execute(`
            CREATE TRIGGER traveller_after_update
            AFTER UPDATE ON traveller
            FOR EACH ROW
            BEGIN
                IF OLD.trip != NEW.trip THEN
                 UPDATE travel
                 SET seats_occupied = GREATEST(seats_occupied - 1, 0)
                 WHERE id = OLD.trip;

                 UPDATE travel
                 SET seats_occupied = seats_occupied + 1
                 WHERE id = NEW.trip;
                END IF;
            END
        `);

        // AFTER DELETE → liberar asiento
        await pool.execute(`DROP TRIGGER IF EXISTS traveller_after_delete`);
        await pool.execute(`
            CREATE TRIGGER traveller_after_delete
            AFTER DELETE ON traveller
            FOR EACH ROW
            BEGIN
                UPDATE travel
                SET seats_occupied = GREATEST(seats_occupied - 1, 0)
                WHERE id = OLD.trip;
            END
        `);

        // BEFORE UPDATE → validar seats_total
        await pool.execute(`DROP TRIGGER IF EXISTS travel_before_update_seats_total`);
        await pool.execute(`
            CREATE TRIGGER travel_before_update_seats_total
                BEFORE UPDATE ON travel
                FOR EACH ROW
                BEGIN
                IF OLD.seats_total != NEW.seats_total THEN
                  IF NEW.seats_total < OLD.seats_occupied THEN
                    SIGNAL SQLSTATE '45000'
                    SET MESSAGE_TEXT = 'No se puede poner seats_total menor que seats_occupied';
                  END IF;
                  IF NEW.seats_total < 30 THEN
                    SIGNAL SQLSTATE '45000'
                    SET MESSAGE_TEXT = 'No se puede poner seats_total menor que 30';
                  END IF;
                END IF;
            END
        `);


        // Índice para búsquedas rápidas en travel por descriptor
        await pool.execute(`DROP INDEX IF EXISTS idx_travel_descriptor ON travel`);
        await pool.execute(`
            CREATE INDEX idx_travel_descriptor ON travel(descriptor)
        `);
        // Índice para búsquedas rápidas en traveller por dni
        await pool.execute(`DROP INDEX IF EXISTS idx_traveller_dni ON traveller`);
        await pool.execute(`
            CREATE INDEX idx_traveller_dni ON traveller(dni)
        `);
        // Índice para búsquedas rápidas en traveller por telefono
        await pool.execute(`DROP INDEX IF EXISTS idx_traveller_phone ON traveller`);
        await pool.execute(`
            CREATE INDEX idx_traveller_phone ON traveller(phone)
        `);

        // Insertar departamentos si no existen
        const [deptRows] = await pool.execute(`SELECT COUNT(*) AS count FROM department`);
        if (deptRows[0].count === 0) {
            for (let i = 0; i < departments.length; i++) {
                await pool.execute(`INSERT INTO department (id, name) VALUES (?, ?)`, [i + 1, departments[i]]);
            }
        }

        // Crear admin si no existe
        const [rows] = await pool.execute(`SELECT * FROM worker WHERE department = ?`, [departments.length]);
        if (rows.length === 0) {
            const hashedPassword = await bcrypt.hash('Almonte@admin', SALT_ROUNDS);
            await pool.execute(`INSERT INTO worker (username, password, department) VALUES (?, ?, ?)`, ['admin', hashedPassword, departments.length]);
        }

    } else {
        const sqlite = db.rawSqlite;

        await sqlite.runAsync(`
            CREATE TABLE IF NOT EXISTS department (
              id INTEGER PRIMARY KEY,
              name TEXT NOT NULL UNIQUE
            )
        `);

        await sqlite.runAsync(`
            CREATE TABLE IF NOT EXISTS travel (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              descriptor TEXT NOT NULL,
              seats_occupied INTEGER NOT NULL,
              seats_total INTEGER NOT NULL,
              department INTEGER NOT NULL,
              bus TEXT NOT NULL,
              FOREIGN KEY (department) REFERENCES department(id)
                ON DELETE CASCADE
                ON UPDATE CASCADE,
              UNIQUE(descriptor, bus)
            )
        `);

        await sqlite.runAsync(`
            CREATE TABLE IF NOT EXISTS traveller (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              dni TEXT NOT NULL UNIQUE,
              name TEXT NOT NULL,
              signup TEXT NOT NULL,
              phone VARCHAR(255) NOT NULL,
              trip INTEGER NOT NULL,
              department INTEGER NOT NULL,
              version INTEGER NOT NULL DEFAULT 0,
              FOREIGN KEY (department) REFERENCES department(id)
                ON DELETE CASCADE
                ON UPDATE CASCADE,
              FOREIGN KEY (trip) REFERENCES travel(id)
                ON DELETE CASCADE
                ON UPDATE CASCADE
            )
        `);

        await sqlite.runAsync(`
            CREATE TABLE IF NOT EXISTS worker (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              username TEXT NOT NULL UNIQUE,
              password TEXT NOT NULL,
              department INTEGER NOT NULL,
              FOREIGN KEY (department) REFERENCES department(id)
                ON DELETE CASCADE
                ON UPDATE CASCADE
            )
        `);

        // Triggers para evitar que seats_occupied supere a seats_total

        // BEFORE INSERT → validar que haya asientos
        await sqlite.runAsync(`DROP TRIGGER IF EXISTS traveller_before_insert`);
        await sqlite.runAsync(`
            CREATE TRIGGER traveller_before_insert
                BEFORE INSERT ON traveller
                FOR EACH ROW
                BEGIN
                    SELECT
                    CASE
                    WHEN (SELECT seats_occupied FROM travel WHERE id = NEW.trip) >=
                    (SELECT seats_total FROM travel WHERE id = NEW.trip)
                    THEN RAISE(ABORT, 'No hay asientos disponibles en este viaje')
                END;
            END;
        `);

        // AFTER INSERT → sumar asiento
        await sqlite.runAsync(`DROP TRIGGER IF EXISTS traveller_after_insert`);
        await sqlite.runAsync(`
            CREATE TRIGGER traveller_after_insert
                AFTER INSERT ON traveller
                FOR EACH ROW
                BEGIN
                    UPDATE travel
                    SET seats_occupied = seats_occupied + 1
                    WHERE id = NEW.trip;
            END;
        `);

        // BEFORE UPDATE → validar cambio de viaje
        await sqlite.runAsync(`DROP TRIGGER IF EXISTS traveller_before_update`);
        await sqlite.runAsync(`
            CREATE TRIGGER traveller_before_update
                BEFORE UPDATE ON traveller
                FOR EACH ROW
                BEGIN
                    SELECT
                    CASE
                    WHEN OLD.trip != NEW.trip
                    AND (SELECT seats_occupied FROM travel WHERE id = NEW.trip) >=
                    (SELECT seats_total FROM travel WHERE id = NEW.trip)
                    THEN RAISE(ABORT, 'No hay asientos disponibles en el nuevo viaje')
                END;
            END;
        `);

        // AFTER UPDATE → ajustar asientos si cambió de viaje
        await sqlite.runAsync(`DROP TRIGGER IF EXISTS traveller_after_update`);
        await sqlite.runAsync(`
            CREATE TRIGGER traveller_after_update
            AFTER UPDATE ON traveller
            FOR EACH ROW
            BEGIN
                UPDATE travel
                  SET seats_occupied = MAX(seats_occupied - 1, 0)
                  WHERE id = OLD.trip AND OLD.trip != NEW.trip;

                UPDATE travel
                  SET seats_occupied = seats_occupied + 1
                  WHERE id = NEW.trip AND OLD.trip != NEW.trip;
            END;
        `);

        // AFTER DELETE → liberar asiento
        await sqlite.runAsync(`DROP TRIGGER IF EXISTS traveller_after_delete`);
        await sqlite.runAsync(`
            CREATE TRIGGER traveller_after_delete
            AFTER DELETE ON traveller
            FOR EACH ROW
            BEGIN
                UPDATE travel
                SET seats_occupied = MAX(seats_occupied - 1, 0)
                WHERE id = OLD.trip;
            END;
        `);

        // BEFORE UPDATE → validar seats_total
        await sqlite.runAsync(`DROP TRIGGER IF EXISTS travel_before_update_seats_total`);
        await sqlite.runAsync(`
            CREATE TRIGGER travel_before_update_seats_total
            BEFORE UPDATE ON travel
            FOR EACH ROW
            BEGIN
                SELECT
                    CASE
                    WHEN OLD.seats_total != NEW.seats_total AND NEW.seats_total < OLD.seats_occupied
                    THEN RAISE(ABORT, 'No se puede poner seats_total menor que seats_occupied')
                END;
                SELECT
                    CASE
                    WHEN OLD.seats_total != NEW.seats_total AND NEW.seats_total < 30
                    THEN RAISE(ABORT, 'No se puede poner seats_total menor que 30')
                END;
            END;
        `);

        // Índice para búsquedas rápidas en travel por descriptor
        await sqlite.runAsync(`DROP INDEX IF EXISTS idx_travel_descriptor`);
        await sqlite.runAsync(`CREATE INDEX idx_travel_descriptor ON travel(descriptor)`);

        // Índice para búsquedas rápidas en traveller por dni
        await sqlite.runAsync(`DROP INDEX IF EXISTS idx_traveller_dni`);
        await sqlite.runAsync(`CREATE INDEX idx_traveller_dni ON traveller(dni)`);

        // Índice para búsquedas rápidas en traveller por phone
        await sqlite.runAsync(`DROP INDEX IF EXISTS idx_traveller_phone`);
        await sqlite.runAsync(`CREATE INDEX idx_traveller_phone ON traveller(phone)`);


        // Insertar departamentos si no existen
        const deptCount = await sqlite.getAsync(`SELECT COUNT(*) as count FROM department`);
        if (deptCount.count === 0) {
            for (let i = 0; i < departments.length; i++) {
                await sqlite.runAsync(`INSERT INTO department (id, name) VALUES (?, ?)`, [i + 1, departments[i]]);
            }
        }

        // Crear admin si no existe
        const existingAdmin = await sqlite.getAsync('SELECT 1 FROM worker WHERE department = ?', [departments.length]);
        if (!existingAdmin) {
            const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASS, SALT_ROUNDS);
            await sqlite.runAsync(`INSERT INTO worker (username, password, department) VALUES (?, ?, ?)`, [process.env.ADMIN_USER, hashedPassword, departments.length]);
        }
    }

    console.log("✅ Base de datos inicializada correctamente");
}

module.exports = { initDatabase };

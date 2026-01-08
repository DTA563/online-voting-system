-- Master Schema for Online Voting System

CREATE DATABASE IF NOT EXISTS voting_system;
USE voting_system;

-- --- DROP TABLES IN REVERSE ORDER ---
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS voter_registry;
DROP TABLE IF EXISTS audit_logs;
DROP TABLE IF EXISTS votes;
DROP TABLE IF EXISTS voter_status;
DROP TABLE IF EXISTS candidates;
DROP TABLE IF EXISTS positions;
DROP TABLE IF EXISTS elections;
DROP TABLE IF EXISTS users;
SET FOREIGN_KEY_CHECKS = 1;

-- 1. Users Table (Identity only)
CREATE TABLE users (
    user_id VARCHAR(50) PRIMARY KEY, 
    full_name VARCHAR(100) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('voter', 'admin', 'super_admin') DEFAULT 'voter',
    status ENUM('active', 'deactivated') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE elections (
    election_id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    start_date DATETIME NOT NULL,
    end_date DATETIME NOT NULL,
    is_published BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Voter Registry (THE MASTER LIST)
-- This table defines who is ALLOWED to vote in which election.
CREATE TABLE voter_registry (
    registry_id INT AUTO_INCREMENT PRIMARY KEY,
    election_id INT,
    user_id VARCHAR(50), -- This ID doesn't even have to exist in 'users' yet!
    FOREIGN KEY (election_id) REFERENCES elections(election_id) ON DELETE CASCADE,
    UNIQUE KEY unique_registration (election_id, user_id)
) ENGINE=InnoDB;

CREATE TABLE positions (
    position_id INT AUTO_INCREMENT PRIMARY KEY,
    election_id INT,
    title VARCHAR(100) NOT NULL,
    FOREIGN KEY (election_id) REFERENCES elections(election_id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE candidates (
    candidate_id INT AUTO_INCREMENT PRIMARY KEY,
    position_id INT,
    full_name VARCHAR(100) NOT NULL,
    manifesto TEXT,
    photo_url VARCHAR(255),
    FOREIGN KEY (position_id) REFERENCES positions(position_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 6. Voter Status (Participation)
CREATE TABLE voter_status (
    status_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    election_id INT NOT NULL,
    has_voted BOOLEAN DEFAULT FALSE,
    voted_at DATETIME DEFAULT NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (election_id) REFERENCES elections(election_id) ON DELETE CASCADE,
    UNIQUE KEY unique_voter_status (user_id, election_id)
) ENGINE=InnoDB;

-- 7. Votes (Ballots)
CREATE TABLE votes (
    vote_id INT AUTO_INCREMENT PRIMARY KEY,
    election_id INT NOT NULL,
    candidate_id INT NOT NULL,
    vote_hour DATETIME DEFAULT NULL, 
    FOREIGN KEY (election_id) REFERENCES elections(election_id) ON DELETE CASCADE,
    FOREIGN KEY (candidate_id) REFERENCES candidates(candidate_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 8. Audit Logs
CREATE TABLE audit_logs (
    log_id INT AUTO_INCREMENT PRIMARY KEY,
    performed_by VARCHAR(50), 
    action VARCHAR(255) NOT NULL, 
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (performed_by) REFERENCES users(user_id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- SEED DATA
INSERT INTO users (user_id, full_name, password_hash, role, status) 
VALUES ('SEED_SUPER_ADMIN', 'Initial System Root', '$2b$10$6p/p2VfVfDndjB0I9.IHeuN.GfA.X7h.Xo8Hh6Hh6Hh6Hh6Hh6Hh6', 'super_admin', 'active');
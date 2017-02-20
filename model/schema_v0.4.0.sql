-- MySQL Script generated by MySQL Workbench
-- 02/18/17 19:19:48
-- Model: New Model    Version: 1.0
-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='TRADITIONAL,ALLOW_INVALID_DATES';

-- -----------------------------------------------------
-- Schema mydb
-- -----------------------------------------------------
-- -----------------------------------------------------
-- Schema yoongoodb
-- -----------------------------------------------------

-- -----------------------------------------------------
-- Schema yoongoodb
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `yoongoodb` DEFAULT CHARACTER SET utf8 ;
USE `yoongoodb` ;

-- -----------------------------------------------------
-- Table `yoongoodb`.`user`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `yoongoodb`.`user` (
  `idx` INT(11) NOT NULL AUTO_INCREMENT COMMENT 'index',
  `id_token` VARCHAR(500) NULL DEFAULT NULL,
  `user_id` VARCHAR(45) NOT NULL COMMENT 'user\'s primary id.',
  `nickname` VARCHAR(45) NULL DEFAULT NULL COMMENT 'user\'s nickname',
  `password` VARCHAR(100) NOT NULL,
  `state_message` VARCHAR(100) NULL DEFAULT NULL,
  `username` VARCHAR(45) NULL DEFAULT NULL,
  `img` VARCHAR(45) NULL DEFAULT NULL COMMENT 'user\'s img',
  `email` VARCHAR(45) NULL DEFAULT NULL COMMENT 'user\'s email',
  `changed_at` DATETIME(6) NULL DEFAULT NULL,
  `created_at` DATETIME(6) NOT NULL COMMENT 'user\'s created date.',
  `device_info` VARCHAR(100) NULL DEFAULT NULL,
  PRIMARY KEY (`idx`),
  UNIQUE INDEX `id_UNIQUE` (`user_id` ASC),
  UNIQUE INDEX `nickname_UNIQUE` (`nickname` ASC))
ENGINE = InnoDB
AUTO_INCREMENT = 195
DEFAULT CHARACTER SET = utf8
COMMENT = 'user info';


-- -----------------------------------------------------
-- Table `yoongoodb`.`user_flag`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `yoongoodb`.`user_flag` (
  `idx` INT(11) NOT NULL AUTO_INCREMENT,
  `user_idx` INT(11) NOT NULL,
  `nickname` VARCHAR(45) NOT NULL,
  `title` VARCHAR(40) NOT NULL,
  `message` VARCHAR(600) NOT NULL COMMENT 'created message of flag message.',
  `latitude` FLOAT NOT NULL,
  `longitude` FLOAT NOT NULL,
  `username` VARCHAR(45) NULL DEFAULT NULL,
  `modified_at` DATETIME(6) NULL DEFAULT NULL,
  `created_at` DATETIME(6) NULL DEFAULT NULL,
  `img` VARCHAR(45) NULL DEFAULT NULL,
  PRIMARY KEY (`idx`),
  INDEX `fk_user_flag_user_idx` (`user_idx` ASC),
  CONSTRAINT `fk_user_flag_user`
    FOREIGN KEY (`user_idx`)
    REFERENCES `yoongoodb`.`user` (`idx`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB
AUTO_INCREMENT = 851
DEFAULT CHARACTER SET = utf8;


-- -----------------------------------------------------
-- Table `yoongoodb`.`friends`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `yoongoodb`.`friends` (
  `idx` INT NOT NULL AUTO_INCREMENT,
  `from` INT(11) NOT NULL,
  `to` INT(11) NOT NULL,
  `status` INT NOT NULL,
  PRIMARY KEY (`idx`),
  INDEX `fk_friends_user1_idx` (`from` ASC),
  INDEX `fk_friends_user2_idx` (`to` ASC),
  CONSTRAINT `fk_friends_user1`
    FOREIGN KEY (`from`)
    REFERENCES `yoongoodb`.`user` (`idx`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_friends_user2`
    FOREIGN KEY (`to`)
    REFERENCES `yoongoodb`.`user` (`idx`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;

SHOW databases;

DROP DATABASE dbdeskproject;
DROP Database Gregs_list;
CREATE DATABASE IF NOT EXISTS `dbDeskProject`;
USE dbDeskProject;
SHOW TABLES;
SELECT * FROM nextperson;

CREATE USER DeskUser@localhost identified by 'desk123!@#';
CREATE USER DeskUser@127.0.0.1 identified by 'desk123!@#';
grant all privileges on `dbDeskProject` to DeskUser@localhost;
grant all privileges on `dbDeskProject` to DeskUser@127.0.0.1;
flush privileges;

REVOKE ALL PRIVILEGES, GRANT OPTION FROM DeskUser@localhost;
REVOKE ALL PRIVILEGES, GRANT OPTION FROM DeskUser@127.0.0.1;

select host, user, password from mysql.user;
show grants For DeskUser@localhost;
show grants For DeskUser@127.0.0.1;

/*nextPerson*/
CREATE TABLE IF NOT EXISTS `dbDeskProject`.`nextPerson` (
  `person_id` INT(11) NOT NULL AUTO_INCREMENT,
  `person_name` VARCHAR(255) NULL DEFAULT NULL,
  `person_nickname` VARCHAR(255) NULL DEFAULT NULL,
  `person_password` VARCHAR(255) NULL DEFAULT NULL,
  PRIMARY KEY (`person_id`))
ENGINE = InnoDB
AUTO_INCREMENT = 14
DEFAULT CHARACTER SET = utf8
;

/*nextDesk*/
CREATE TABLE IF NOT EXISTS `dbDeskProject`.`nextDesk` (
  `desk_id` INT(11) NOT NULL AUTO_INCREMENT,
  `desk_title` VARCHAR(255) NULL DEFAULT NULL,
  `desk_img` BLOB NULL DEFAULT NULL,
  `desk_upload_date` DATETIME NULL DEFAULT NULL,
  `desk_file_path` VARCHAR(255) NOT NULL,
  `owner_id` INT(11) NOT NULL,
  PRIMARY KEY (`desk_id`),
  INDEX `fk_PerOrders` (`owner_id` ASC),
  CONSTRAINT `fk_PerOrders`
    FOREIGN KEY (`owner_id`)
    REFERENCES `dbDeskProject`.`nextPerson` (`person_id`))
ENGINE = InnoDB
AUTO_INCREMENT = 10
DEFAULT CHARACTER SET = utf8
;


/*deskComment*/
CREATE TABLE IF NOT EXISTS `dbDeskProject`.`deskComment` (
  `comment_id` INT(11) NOT NULL AUTO_INCREMENT,
  `comment_contents` VARCHAR(255) NOT NULL,
  `comment_date` DATETIME NULL DEFAULT NULL,
  `desk_id` INT(11) NOT NULL,
  `writer_id` INT(11) NOT NULL,
  PRIMARY KEY (`comment_id`),
  INDEX `fk_desk` (`desk_id` ASC),
  INDEX `fk_writer` (`writer_id` ASC),
  CONSTRAINT `fk_desk`
    FOREIGN KEY (`desk_id`)
    REFERENCES `dbDeskProject`.`nextDesk` (`desk_id`),
  CONSTRAINT `fk_writer`
    FOREIGN KEY (`writer_id`)
    REFERENCES `dbDeskProject`.`nextPerson` (`person_id`))
ENGINE = InnoDB
AUTO_INCREMENT = 35
DEFAULT CHARACTER SET = utf8
;
/*CommentReply*/
CREATE TABLE IF NOT EXISTS `dbDeskProject`.`commentReply` (
  `reply_id` INT(11) NOT NULL AUTO_INCREMENT,
  `reply_contents` VARCHAR(255) NULL DEFAULT NULL,
  `deskComment_comment_id` INT(11) NULL DEFAULT NULL,
  `nextPerson_person_id` INT(11) NULL DEFAULT NULL,
  PRIMARY KEY (`reply_id`),
  INDEX `fk_commentReply_deskComment1_idx` (`deskComment_comment_id` ASC),
  INDEX `fk_commentReply_nextPerson1_idx` (`nextPerson_person_id` ASC),
  CONSTRAINT `fk_commentReply_deskComment1`
    FOREIGN KEY (`deskComment_comment_id`)
    REFERENCES `dbDeskProject`.`deskComment` (`comment_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_commentReply_nextPerson1`
    FOREIGN KEY (`nextPerson_person_id`)
    REFERENCES `dbDeskProject`.`nextPerson` (`person_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB
AUTO_INCREMENT = 2
DEFAULT CHARACTER SET = utf8
;

/*commentLike*/
CREATE TABLE IF NOT EXISTS `dbDeskProject`.`commentLike` (
  `commentLike_id` INT(11) NOT NULL AUTO_INCREMENT,
  `deskComment_comment_id` INT(11) NULL DEFAULT NULL,
  `nextPerson_person_id` INT(11) NULL DEFAULT NULL,
  PRIMARY KEY (`commentLike_id`),
  INDEX `fk_commentLike_deskComment1_idx` (`deskComment_comment_id` ASC),
  INDEX `fk_commentLike_nextPerson1_idx` (`nextPerson_person_id` ASC),
  CONSTRAINT `fk_commentLike_deskComment1`
    FOREIGN KEY (`deskComment_comment_id`)
    REFERENCES `dbDeskProject`.`deskComment` (`comment_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_commentLike_nextPerson1`
    FOREIGN KEY (`nextPerson_person_id`)
    REFERENCES `dbDeskProject`.`nextPerson` (`person_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8
;

/*sp_addComment*/
delimiter //
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_addComment`(
        in p_contents varchar(255),
        in p_desk int,
        in p_writer int
)
BEGIN 
    insert into deskComment(
		comment_contents,
		comment_date,
		desk_id ,
		writer_id
    )
    values
    (
        p_contents,
       now(),
        p_desk,
        p_writer
    );
END //

/*sp_addDesk*/
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_addDesk`(
    IN p_title varchar(255),
    IN p_file_path varchar(255),
    IN p_owner_id int
)
begin   
    insert into nextDesk(
        desk_title,
        desk_file_path,
        desk_upload_date,
        owner_id
    )
    values(
        p_title,
        p_file_path,
        now(),
        p_owner_id
    );
END //


/*sp_addReply*/
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_addReply`(
in p_owner_id int,
in p_contents varchar(255),
in p_deskComment_id int
)
BEGIN
    insert commentReply(
        reply_contents,
        deskComment_comment_id,
        nextPerson_person_id
    )
    values(
        p_contents,
        p_deskComment_id,
        p_owner_id
    );
END //


/*sp_createUser*/
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_createUser`(
    in p_name varchar(255),
    in p_nickname varchar(255),
    in p_password varchar(255)
)
BEGIN
    if(select exists (select 1 from nextPerson where person_nickname = p_nickname)) 
        then select 'That Nickname Exists !!'; 
    else 
        insert into nextPerson
        (
            person_name,
            person_nickname,
            person_password
        )
        values
        (
            p_name,
            p_nickname,
            p_password
        );

    end if;
END //

/*sp_getCommentByDesk*/
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_getCommentByDesk`(
    in p_desk_id int
)
BEGIN
    select * from deskComment as dc where dc.desk_id = p_desk_id; 
END //

/*sp_getDesk*/
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_getDesk`()
BEGIN
    select * from nextDesk;
END //


/*sp_getReplyByComment*/
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_getReplyByComment`(
    in p_desk_id int
)
BEGIN
    select * from deskComment as dc where dc.desk_id = p_desk_id; 
END //


/*sp_getUserNickName*/
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_getUserNickName`(
    IN p_owner_id int
)
BEGIN
    select person_nickname from nextPerson as np where np.person_id = p_owner_id;
END //


/*sp_validateLogin*/
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_validateLogin`(
in p_nickname varchar(20)
)
BEGIN
    select * from nextPerson as up where up.person_nickname = p_nickname;

END //
delimiter ;


SELECT * FROM nextperson;
SHOW TABLES;
SELECT * FROM nextdesk;
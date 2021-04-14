CREATE DATABASE test_database;

USE test_database;

CREATE TABLE `user` (
  `id`  INT(11) NOT NULL AUTO_INCREMENT,
  `name`  VARCHAR(255) NOT NULL,
  `email`  VARCHAR(255) NOT NULL,
  `superuser`  INT(11) NOT NULL DEFAULT 0,
  `inactive`  INT(11) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`)
) DEFAULT CHARSET=utf8;

INSERT INTO `user` VALUES (1,'Harmony Vasquez','harmony.vasquez@gmail.com',0,0);
INSERT INTO `user` VALUES (2,'Jasper Fraley','jasper.fraley@seznam.cz',1,0);
INSERT INTO `user` VALUES (3,'Neil Henry','neil.henry@iol.com',0,1);
INSERT INTO `user` VALUES (4,'Merver Chin','merver.chin@gmail.com',1,0);

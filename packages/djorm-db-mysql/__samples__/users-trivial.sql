CREATE TABLE `user` (
  `id`  INT(11) NOT NULL AUTO_INCREMENT,
  `name`  VARCHAR(255) NOT NULL,
  `email`  VARCHAR(255) NOT NULL,
  `superuser`  INT(11) NOT NULL DEFAULT 0,
  `inactive`  INT(11) NOT NULL DEFAULT 0,
  `rating` FLOAT NOT NULL DEFAULT 0,
  `createdAt` DATETIME NOT NULL,
  `updatedAt` DATETIME DEFAULT NULL,
  PRIMARY KEY (`id`)
) DEFAULT CHARSET=utf8;

INSERT INTO `user` VALUES (1,'Harmony Vasquez','harmony.vasquez@gmail.com',0,0,5,'2020-01-01T20:20:20', NULL);
INSERT INTO `user` VALUES (2,'Jasper Fraley','jasper.fraley@seznam.cz',1,0,3.5,'2020-01-01T21:21:21', NULL);
INSERT INTO `user` VALUES (3,'Neil Henry','neil.henry@iol.com',0,1,1,'2020-01-01T22:22:22', NULL);
INSERT INTO `user` VALUES (4,'Merver Chin','merver.chin@gmail.com',1,0,2.75,'2020-01-01T23:23:23', NULL);

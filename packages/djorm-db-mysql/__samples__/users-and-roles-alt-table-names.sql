CREATE TABLE `user-alternative` (
  `id`  INTEGER NOT NULL AUTO_INCREMENT,
  `name`  TEXT NOT NULL,
  `email`  TEXT NOT NULL,
  `superuser`  INTEGER NOT NULL DEFAULT 0,
  `inactive`  INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY(`id`)
);

CREATE TABLE `role-alternative` (
  `id`  INTEGER NOT NULL AUTO_INCREMENT,
  `name`  TEXT NOT NULL UNIQUE,
  PRIMARY KEY(`id`)
);

CREATE TABLE `userrole-alternative` (
  `id`  INTEGER NOT NULL AUTO_INCREMENT,
  `userId`  INTEGER NOT NULL,
  `roleId`  INTEGER NOT NULL,
  FOREIGN KEY(`roleId`) REFERENCES `role-alternative`(`id`),
  FOREIGN KEY(`userId`) REFERENCES `user-alternative`(`id`),
  PRIMARY KEY(`id`)
);

INSERT INTO `user-alternative` VALUES (1,'Harmony Vasquez','harmony.vasquez@gmail.com',0,0);
INSERT INTO `user-alternative` VALUES (2,'Jasper Fraley','jasper.fraley@seznam.cz',1,0);
INSERT INTO `user-alternative` VALUES (3,'Neil Henry','neil.henry@iol.com',0,1);
INSERT INTO `user-alternative` VALUES (4,'Merver Chin','merver.chin@gmail.com',1,0);
INSERT INTO `role-alternative` VALUES (1,'Staff');
INSERT INTO `role-alternative` VALUES (2,'Contractor');
INSERT INTO `role-alternative` VALUES (3,'Admin');
INSERT INTO `userrole-alternative` VALUES (1,1,1);
INSERT INTO `userrole-alternative` VALUES (2,1,2);
INSERT INTO `userrole-alternative` VALUES (3,2,3);


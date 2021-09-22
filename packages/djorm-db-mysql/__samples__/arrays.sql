CREATE TABLE `intarraymodel` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `arrayField` TEXT,
  PRIMARY KEY (`id`)
) DEFAULT CHARSET=utf8;

CREATE TABLE `nullintarraymodel` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `arrayField` TEXT DEFAULT NULL,
  PRIMARY KEY (`id`)
) DEFAULT CHARSET=utf8;

CREATE TABLE `stringarraymodel` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `arrayField` TEXT,
  PRIMARY KEY (`id`)
) DEFAULT CHARSET=utf8;

CREATE TABLE `nullstringarraymodel` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `arrayField` TEXT DEFAULT NULL,
  PRIMARY KEY (`id`)
) DEFAULT CHARSET=utf8;

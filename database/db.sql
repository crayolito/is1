Create database  is1

use is1;

CREATE TABLE persona (
    id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    ci bigint ,
    nombre varchar(255) ,
    telefono varchar(255) ,
    password varchar(255)
);

CREATE TABLE fotografo (
    id  INT NOT NULL PRIMARY KEY,
    FOREIGN KEY (id) REFERENCES persona(id),
    studio varchar(255) 
);

CREATE TABLE cliente (
    id  INT NOT NULL PRIMARY KEY,
    nombrefoto VARCHAR(255),
    url    VARCHAR(8000),
    FOREIGN KEY (id) REFERENCES persona(id)
);

CREATE TABLE organizador (
    id  INT NOT NULL PRIMARY KEY,
    FOREIGN KEY (id) REFERENCES persona(id)
);


CREATE TABLE evento(
    id INT NOT NULL AUTO_INCREMENT,
    titulo          VARCHAR(255),
    fecha           VARCHAR(255),
    direccion       VARCHAR(255),
    organizador_id INT,
     PRIMARY KEY (id),
    FOREIGN key (organizador_id)  references organizador(id)
);

CREATE TABLE catalogo(
    id INT NOT NULL AUTO_INCREMENT,
    evento_id INT not null,
    PRIMARY KEY (id),
    FOREIGN key (evento_id)  references evento(id)
);


Create Table asignado(
  id   INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
  evento_id INT,
  fotografo_id INT,
  FOREIGN key (evento_id)  references evento(id),
  FOREIGN key (fotografo_id)  references fotografo(id)
);


Create Table foto(
  id   INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(255),
  url    VARCHAR(8000),
  catalogo_id INT,
  fotografo_id INT,
  FOREIGN key (catalogo_id)  references catalogo (id),
  FOREIGN key (fotografo_id)  references fotografo(id)
);

Create Table ia(
  id   INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
  foto_id INT,
  cliente_id INT,
  FOREIGN key (foto_id)  references foto(id),
  FOREIGN key (cliente_id)  references cliente(id)
);
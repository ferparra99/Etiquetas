-- Datos de EJEMPLO para pruebas. Reemplazar por la importación del Excel real.
INSERT INTO project (name) VALUES ('Proyecto demo');

INSERT INTO cable (project_id, code, cable_type, origin_location, origin_detail, destination_location, destination_detail)
SELECT p.id, c.code, c.cable_type, c.o_loc, c.o_det, c.d_loc, c.d_det
FROM project p,
     (VALUES
        ('BB.RK-RK.0801.12.07', 'BlackBox', 'Rack #8', 'Posición 12', 'Rack #1', 'Puerto 7'),
        ('V07206 VJF B06',      'Ejemplo',  'Estudio A', 'Wallbox 3',  'Rack #2', 'Puerto 6'),
        ('V07207 VJF B06',      'Ejemplo',  'Estudio A', 'Wallbox 4',  'Rack #2', 'Puerto 7'),
        ('V07210 VJG B01',      'Ejemplo',  'Estudio B', 'Wallbox 1',  'Rack #3', 'Puerto 1')
     ) AS c (code, cable_type, o_loc, o_det, d_loc, d_det)
WHERE p.name = 'Proyecto demo';

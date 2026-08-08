program estadisticas
    implicit none
    
    ! Declaración de variables libres de memoria
    integer :: edad, colesterol
    real :: peso
    
    ! Variables para acumular los cálculos estadísticos
    integer :: total_clientes = 0
    integer :: suma_edad = 0
    real :: max_peso = 0.0
    integer :: min_colesterol = 99999  ! Inicializado alto para encontrar el mínimo real
    
    real :: edad_media = 0.0
    integer :: io_status = 0
    
    ! 1. Apertura del archivo de datos generado por Python
    open(unit=10, file='datos_medicos.txt', status='old', action='read', iostat=io_status)
    
    if (io_status /= 0) then
        print *, "0.0|0.0 kg|0 mg/dL"  ! Si no hay archivo, devolvemos valores vacíos ordenados
        stop
    end if
    
    ! 2. Bucle de lectura hasta el final del archivo (End of File)
    do
        read(10, *, iostat=io_status) edad, peso, colesterol
        if (io_status /= 0) exit  ! Si llega al final del archivo o hay error, sale del bucle
        
        total_clientes = total_clientes + 1
        suma_edad = suma_edad + edad
        
        ! Calcular el peso máximo
        if (peso > max_peso) max_peso = peso
        
        ! Calcular el colesterol mínimo
        if (colesterol < min_colesterol) min_colesterol = colesterol
    end do
    
    close(10)
    
    ! 3. Evitar división por cero si la base de datos está vacía
    if (total_clientes > 0) then
        edad_media = real(suma_edad) / real(total_clientes)
    else
        min_colesterol = 0
    end if
    
    ! 4. Imprimir salida formateada con tuberías '|' para que Node.js la procese al vuelo
    write(*, '(F5.1, A, F6.1, A, I5, A)') &
        edad_media, '|', max_peso, ' kg|', min_colesterol, ' mg/dL'

end program estadisticas
IDENTIFICATION DIVISION.
       PROGRAM-ID. SEGURO-CLIENTE.
       
       ENVIRONMENT DIVISION.
       INPUT-OUTPUT SECTION.
       FILE-CONTROL.
           SELECT FACTURA-FILE ASSIGN TO "datos_seguro.txt"
           ORGANIZATION IS LINE SEQUENTIAL.

       DATA DIVISION.
       FILE SECTION.
       FD  FACTURA-FILE.
       01  REGISTRO-SEGURO.
           05  F-NUM-SEGURO  PIC X(15).
           05  F-CUOTA       PIC 9(5)V99.

       WORKING-STORAGE SECTION.
       01  WS-EOF            PIC X(1) VALUE "N".
       01  WS-IMPUESTO       PIC 9(4)V99.
       01  WS-RECARGO        PIC 9(4)V99.
       01  WS-TOTAL-COBRAR   PIC 9(5)V99.
       
       01  ED-CUOTA          PIC ZZZ99.99.
       01  ED-IMPUESTO       PIC ZZZ99.99.
       01  ED-RECARGO        PIC ZZZ99.99.
       01  ED-TOTAL          PIC ZZZ99.99.

       PROCEDURE DIVISION.
       MAIN-PROCEDURE.
           OPEN INPUT FACTURA-FILE
           
           READ FACTURA-FILE
               AT END MOVE "S" TO WS-EOF
           END-READ
           
           IF WS-EOF = "N"
               COMPUTE WS-IMPUESTO = F-CUOTA * 0.15
               COMPUTE WS-RECARGO = F-CUOTA * 0.05
               COMPUTE WS-TOTAL-COBRAR = F-CUOTA + WS-IMPUESTO 
                                                 + WS-RECARGO
               
               MOVE F-CUOTA TO ED-CUOTA
               MOVE WS-IMPUESTO TO ED-IMPUESTO
               MOVE WS-RECARGO TO ED-RECARGO
               MOVE WS-TOTAL-COBRAR TO ED-TOTAL
               
               DISPLAY FUNCTION TRIM(F-NUM-SEGURO) "|" 
                       FUNCTION TRIM(ED-CUOTA) "|" 
                       FUNCTION TRIM(ED-IMPUESTO) "|" 
                       FUNCTION TRIM(ED-RECARGO) "|" 
                       FUNCTION TRIM(ED-TOTAL)
           ELSE
               DISPLAY "ERROR|0|0|0|0"
           END-IF
           
           CLOSE FACTURA-FILE
           STOP RUN.
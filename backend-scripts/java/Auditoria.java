import java.io.FileWriter;
import java.io.IOException;
import java.io.PrintWriter;
import java.time.LocalDateTime;

public class Auditoria {
    public static void main(String[] args) {
        if (args.length < 1) {
            System.out.println("JAVA_ERROR|No se indico ID para auditar");
            return;
        }
        
        String idAuditado = args[0];
        String timestamp = LocalDateTime.now().toString();
        
        // Dibujito del café
        System.out.println("    (  )   (   )  ");
        System.out.println("     ) (   )  (   ");
        System.out.println("     ( )  (    )  ");
        System.out.println("    ___________    ");
        System.out.println("   |           |___ ");
        System.out.println("   |   JAVA    |   |");
        System.out.println("   |   CAFE    |   |");
        System.out.println("   |___________|___|");
        System.out.println("    \\___________/  ");
        System.out.println("¡Auditoría caliente servida!\n");
        
        try (FileWriter fw = new FileWriter("log_auditoria.txt", true);
             PrintWriter pw = new PrintWriter(fw)) {
            pw.println("AUDIT|" + timestamp + "|Consulta realizada sobre ID: " + idAuditado);
            System.out.println("JAVA_OK|Auditado con exito");
        } catch (IOException e) {
            System.out.println("JAVA_ERROR|No se pudo escribir el log");
        }
    }
}
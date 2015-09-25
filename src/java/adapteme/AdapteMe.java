/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package adapteme;

import br.usp.icmc.amenu.AMenuStandaloneSetup;
import com.google.inject.Injector;
import dsl.Generator;
import java.io.BufferedWriter;
import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.ArrayList;
import java.util.ResourceBundle;
import javax.faces.context.FacesContext;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.eclipse.emf.common.util.EList;
import org.eclipse.emf.ecore.resource.Resource;
import org.json.JSONObject;

/**
 *
 * @author humbertolidioantonelli
 */
public class AdapteMe extends HttpServlet {
    
    private final ParserHTML amenu = new ParserHTML();
    
    private String menuHtml, menuCss, menuJs;
    ArrayList<String> textErrors = null;

    /**
     * Processes requests for both HTTP <code>GET</code> and <code>POST</code>
     * methods.
     *
     * @param request servlet request
     * @param response servlet response
     * @throws ServletException if a servlet-specific error occurs
     * @throws IOException if an I/O error occurs
     */
    protected void processRequest(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        request.setCharacterEncoding("utf8");
        //response.setCharacterEncoding("utf8");
        response.setContentType("application/json");
        
        JSONObject JObject = new JSONObject(); 
        
        try (PrintWriter out = response.getWriter()) {
            
            //this.amenu.generate("_1442584997703","mmenu","font-size=251%,border=#2c9b17", "<nav id=\"WWxkV2RXUlJQVDA9\" style=\"font-size:20px !important;\"> <h2><i class=\"fa fa-reorder\"></i>MENU</h2><ul><li id=\"subitem1\"><a href=\"http://agua.intermidia.icmc.usp.br/menu/e/\" title=\"Início\"> Início</a></li><li id=\"subitem2\"><a href=\"http://agua.intermidia.icmc.usp.br/menu/e/\" title=\"Guias e mapas\"> Guias e mapas</a><ul id=\"submenuitem2\"><li id=\"subitem2_1\"><a href=\"http://agua.intermidia.icmc.usp.br/menu/e/\" title=\"Hotéis\"> Hotéis</a></li><li id=\"subitem2_2\"><a href=\"http://agua.intermidia.icmc.usp.br/menu/e/\" title=\"Restaurantes\"> Restaurantes</a></li><li id=\"subitem2_3\"><a href=\"http://agua.intermidia.icmc.usp.br/menu/e/\" title=\"Atrações\"> Atrações</a></li><li id=\"subitem2_4\"><a href=\"http://agua.intermidia.icmc.usp.br/menu/e/\" title=\"Guia de Ruas\"> Guia de Ruas</a></li><li id=\"subitem2_5\"><a href=\"http://agua.intermidia.icmc.usp.br/menu/e/\" title=\"Guia Rodoviário\"> Guia Rodoviário</a></li><li id=\"subitem2_6\"><a href=\"http://agua.intermidia.icmc.usp.br/menu/e/\" title=\"Roteiros do Brasil\"> Roteiros do Brasil</a></li></ul></li><li id=\"subitem3\"><a href=\"http://agua.intermidia.icmc.usp.br/menu/e/\" title=\"Dicas de Viagem\"> Dicas de Viagem</a><ul id=\"submenuitem2\"><li id=\"subitem3_1\"><a href=\"http://agua.intermidia.icmc.usp.br/menu/e/\" title=\"Ecoturismo\"> Ecoturismo</a></li><li id=\"subitem3_2\"><a href=\"http://agua.intermidia.icmc.usp.br/menu/e/\" title=\"Centros Urbanos\"> Centros Urbanos</a></li><li id=\"subitem3_3\"><a href=\"http://agua.intermidia.icmc.usp.br/menu/e/\" title=\"Estudantes\"> Estudantes</a></li><li id=\"subitem3_4\"><a href=\"http://agua.intermidia.icmc.usp.br/menu/e/\" title=\"Família e Crianças\"> Família e Crianças</a></li><li id=\"subitem3_5\"><a href=\"http://agua.intermidia.icmc.usp.br/menu/e/\" title=\"Lugares Românticos\"> Lugares Românticos</a></li><li id=\"subitem3_6\"><a href=\"http://agua.intermidia.icmc.usp.br/menu/e/\" title=\"Mochileiros\"> Mochileiros</a></li><li id=\"subitem3_7\"><a href=\"http://agua.intermidia.icmc.usp.br/menu/e/\" title=\"Praia e Descanso\"> Praia e Descanso</a></li><li id=\"subitem3_8\"><a href=\"http://agua.intermidia.icmc.usp.br/menu/e/\" title=\"Turismo Cultural\"> Turismo Cultural</a></li><li id=\"subitem3_9\"><a href=\"http://agua.intermidia.icmc.usp.br/menu/e/\" title=\"Música para Viagem\"> Música para Viagem</a></li></ul></li><li id=\"subitem4\"><a href=\"http://agua.intermidia.icmc.usp.br/menu/e/\" title=\"Sobre o site\"> Sobre o site</a></li><li id=\"subitem5\"><a href=\"http://agua.intermidia.icmc.usp.br/menu/e/\" title=\"Contato\"> Contato</a></li></ul></nav>");
   
            this.amenu.generate(request.getParameter("name_menu"), request.getParameter("type_menu"), request.getParameter("config_menu"), request.getParameter("code_menu"));
            
	    
            Injector injector = new AMenuStandaloneSetup().createInjectorAndDoEMFRegistration();
            Generator gen = injector.getInstance(Generator.class);
            gen.runGenerator(this.amenu.getAmenu(), "target");

            EList<Resource.Diagnostic> errors = gen.getErrors();
            if (errors == null) {
                //this.menuHtml = gen.getCode("html");
                //this.menuCss = gen.getCode("css");
                //this.menuJs = gen.getCode("js");
                
                this.menuHtml = gen.getCode("html");
                this.menuHtml = this.menuHtml.replaceAll("\t", "");
                this.menuHtml = this.menuHtml.replaceAll("\n", "");
                JObject.put("html", this.menuHtml);
		
		this.menuCss = gen.getCode("css");
                this.menuCss = this.menuCss.replaceAll("\t", "");
                this.menuCss = this.menuCss.replaceAll("\n", "");
                JObject.put("css", this.menuCss);
		
		this.menuJs = gen.getCode("js_inline");
                this.menuJs = this.menuJs.replaceAll("\t", "");
                this.menuJs = this.menuJs.replaceAll("\n", "");
                JObject.put("js", this.menuJs);
                

            } else {
                
                errors.stream().forEach((d) -> {
                    this.textErrors.add("Line:" + d.getLine() + "Message" + d.getMessage());
                });
                JObject.put("error",  this.textErrors);
                //JObject.put("html", "<nav id=\"WWxkV2RXUlJQVDA9\" style=\"font-size:20px !important;\"> <h2><i class=\"fa fa-reorder\"></i>MENU</h2><ul><li id=\"subitem1\"><a href=\"http://agua.intermidia.icmc.usp.br/menu/e/\" title=\"Início\"> Início</a></li><li id=\"subitem2\"><a href=\"http://agua.intermidia.icmc.usp.br/menu/e/\" title=\"Guias e mapas\"> Guias e mapas</a><ul id=\"submenuitem2\"><li id=\"subitem2_1\"><a href=\"http://agua.intermidia.icmc.usp.br/menu/e/\" title=\"Hotéis\"> Hotéis</a></li><li id=\"subitem2_2\"><a href=\"http://agua.intermidia.icmc.usp.br/menu/e/\" title=\"Restaurantes\"> Restaurantes</a></li><li id=\"subitem2_3\"><a href=\"http://agua.intermidia.icmc.usp.br/menu/e/\" title=\"Atrações\"> Atrações</a></li><li id=\"subitem2_4\"><a href=\"http://agua.intermidia.icmc.usp.br/menu/e/\" title=\"Guia de Ruas\"> Guia de Ruas</a></li><li id=\"subitem2_5\"><a href=\"http://agua.intermidia.icmc.usp.br/menu/e/\" title=\"Guia Rodoviário\"> Guia Rodoviário</a></li><li id=\"subitem2_6\"><a href=\"http://agua.intermidia.icmc.usp.br/menu/e/\" title=\"Roteiros do Brasil\"> Roteiros do Brasil</a></li></ul></li><li id=\"subitem3\"><a href=\"http://agua.intermidia.icmc.usp.br/menu/e/\" title=\"Dicas de Viagem\"> Dicas de Viagem</a><ul id=\"submenuitem2\"><li id=\"subitem3_1\"><a href=\"http://agua.intermidia.icmc.usp.br/menu/e/\" title=\"Ecoturismo\"> Ecoturismo</a></li><li id=\"subitem3_2\"><a href=\"http://agua.intermidia.icmc.usp.br/menu/e/\" title=\"Centros Urbanos\"> Centros Urbanos</a></li><li id=\"subitem3_3\"><a href=\"http://agua.intermidia.icmc.usp.br/menu/e/\" title=\"Estudantes\"> Estudantes</a></li><li id=\"subitem3_4\"><a href=\"http://agua.intermidia.icmc.usp.br/menu/e/\" title=\"Família e Crianças\"> Família e Crianças</a></li><li id=\"subitem3_5\"><a href=\"http://agua.intermidia.icmc.usp.br/menu/e/\" title=\"Lugares Românticos\"> Lugares Românticos</a></li><li id=\"subitem3_6\"><a href=\"http://agua.intermidia.icmc.usp.br/menu/e/\" title=\"Mochileiros\"> Mochileiros</a></li><li id=\"subitem3_7\"><a href=\"http://agua.intermidia.icmc.usp.br/menu/e/\" title=\"Praia e Descanso\"> Praia e Descanso</a></li><li id=\"subitem3_8\"><a href=\"http://agua.intermidia.icmc.usp.br/menu/e/\" title=\"Turismo Cultural\"> Turismo Cultural</a></li><li id=\"subitem3_9\"><a href=\"http://agua.intermidia.icmc.usp.br/menu/e/\" title=\"Música para Viagem\"> Música para Viagem</a></li></ul></li><li id=\"subitem4\"><a href=\"http://agua.intermidia.icmc.usp.br/menu/e/\" title=\"Sobre o site\"> Sobre o site</a></li><li id=\"subitem5\"><a href=\"http://agua.intermidia.icmc.usp.br/menu/e/\" title=\"Contato\"> Contato</a></li></ul></nav>"); 
                
            }
	    
             
            out.print(JObject);
            
            /*
            {
                "html": "<nav id=\"WWxkV2RXUlJQVDA9\" style=\"font-size:20px !important;\"> <h2><i class=\"fa fa-reorder\"></i>MENU</h2><ul><li id=\"subitem1\"><a href=\"http://agua.intermidia.icmc.usp.br/menu/e/\" title=\"Início\"> Início</a></li><li id=\"subitem2\"><a href=\"http://agua.intermidia.icmc.usp.br/menu/e/\" title=\"Guias e mapas\"> Guias e mapas</a><ul id=\"submenuitem2\"><li id=\"subitem2_1\"><a href=\"http://agua.intermidia.icmc.usp.br/menu/e/\" title=\"Hotéis\"> Hotéis</a></li><li id=\"subitem2_2\"><a href=\"http://agua.intermidia.icmc.usp.br/menu/e/\" title=\"Restaurantes\"> Restaurantes</a></li><li id=\"subitem2_3\"><a href=\"http://agua.intermidia.icmc.usp.br/menu/e/\" title=\"Atrações\"> Atrações</a></li><li id=\"subitem2_4\"><a href=\"http://agua.intermidia.icmc.usp.br/menu/e/\" title=\"Guia de Ruas\"> Guia de Ruas</a></li><li id=\"subitem2_5\"><a href=\"http://agua.intermidia.icmc.usp.br/menu/e/\" title=\"Guia Rodoviário\"> Guia Rodoviário</a></li><li id=\"subitem2_6\"><a href=\"http://agua.intermidia.icmc.usp.br/menu/e/\" title=\"Roteiros do Brasil\"> Roteiros do Brasil</a></li></ul></li><li id=\"subitem3\"><a href=\"http://agua.intermidia.icmc.usp.br/menu/e/\" title=\"Dicas de Viagem\"> Dicas de Viagem</a><ul id=\"submenuitem2\"><li id=\"subitem3_1\"><a href=\"http://agua.intermidia.icmc.usp.br/menu/e/\" title=\"Ecoturismo\"> Ecoturismo</a></li><li id=\"subitem3_2\"><a href=\"http://agua.intermidia.icmc.usp.br/menu/e/\" title=\"Centros Urbanos\"> Centros Urbanos</a></li><li id=\"subitem3_3\"><a href=\"http://agua.intermidia.icmc.usp.br/menu/e/\" title=\"Estudantes\"> Estudantes</a></li><li id=\"subitem3_4\"><a href=\"http://agua.intermidia.icmc.usp.br/menu/e/\" title=\"Família e Crianças\"> Família e Crianças</a></li><li id=\"subitem3_5\"><a href=\"http://agua.intermidia.icmc.usp.br/menu/e/\" title=\"Lugares Românticos\"> Lugares Românticos</a></li><li id=\"subitem3_6\"><a href=\"http://agua.intermidia.icmc.usp.br/menu/e/\" title=\"Mochileiros\"> Mochileiros</a></li><li id=\"subitem3_7\"><a href=\"http://agua.intermidia.icmc.usp.br/menu/e/\" title=\"Praia e Descanso\"> Praia e Descanso</a></li><li id=\"subitem3_8\"><a href=\"http://agua.intermidia.icmc.usp.br/menu/e/\" title=\"Turismo Cultural\"> Turismo Cultural</a></li><li id=\"subitem3_9\"><a href=\"http://agua.intermidia.icmc.usp.br/menu/e/\" title=\"Música para Viagem\"> Música para Viagem</a></li></ul></li><li id=\"subitem4\"><a href=\"http://agua.intermidia.icmc.usp.br/menu/e/\" title=\"Sobre o site\"> Sobre o site</a></li><li id=\"subitem5\"><a href=\"http://agua.intermidia.icmc.usp.br/menu/e/\" title=\"Contato\"> Contato</a></li></ul></nav>",
                "plugin": "http://multi-level-push-menu.make.rs/demo/jquery.multilevelpushmenu.min.js",
                "js": "$(document).ready(function(){$('#WWxkV2RXUlJQVDA9').multilevelpushmenu({containersToPush: [$( '#global' )],collapsed: true,backText: 'Voltar',preventItemClick: false });});",
                "css": [
                    "http://netdna.bootstrapcdn.com/font-awesome/4.0.1/css/font-awesome.min.css",
                    "http://multi-level-push-menu.make.rs/demo/jquery.multilevelpushmenu.css"
                ]
            }
            */
            
        }
	
    }

    // <editor-fold defaultstate="collapsed" desc="HttpServlet methods. Click on the + sign on the left to edit the code.">
    /**
     * Handles the HTTP <code>GET</code> method.
     *
     * @param request servlet request
     * @param response servlet response
     * @throws ServletException if a servlet-specific error occurs
     * @throws IOException if an I/O error occurs
     */
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        processRequest(request, response);
    }

    /**
     * Handles the HTTP <code>POST</code> method.
     *
     * @param request servlet request
     * @param response servlet response
     * @throws ServletException if a servlet-specific error occurs
     * @throws IOException if an I/O error occurs
     */
    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        processRequest(request, response);
    }

    /**
     * Returns a short description of the servlet.
     *
     * @return a String containing servlet description
     */
    @Override
    public String getServletInfo() {
        return "Short description";
    }// </editor-fold>

}

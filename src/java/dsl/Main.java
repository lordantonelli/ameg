package dsl;

/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
/**
 *
 * @author humbertolidioantonelli
 */
import org.apache.commons.cli.CommandLine;
import org.apache.commons.cli.CommandLineParser;
import org.apache.commons.cli.GnuParser;
import org.apache.commons.cli.HelpFormatter;
import org.apache.commons.cli.Option;
import org.apache.commons.cli.OptionBuilder;
import org.apache.commons.cli.Options;
import org.apache.commons.cli.ParseException;
import br.usp.icmc.amenu.AMenuStandaloneSetup;

import com.google.inject.Injector;
import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.io.IOException;
import java.util.ArrayList;


import java.util.ResourceBundle;
import javax.faces.context.FacesContext;
import org.eclipse.emf.common.util.EList;
import org.eclipse.emf.ecore.resource.Resource;

public class Main {
    
    ArrayList<String> textErrors = null;
    private boolean saveSuccess = false;
    
    public ArrayList<String> getResult(){
        return this.textErrors;
    }
    public boolean isSaveSuccess() {
        return saveSuccess;
    }

    @SuppressWarnings("empty-statement")
	public void executar() throws IOException {
            
            this.textErrors = new ArrayList<>();
            
            String[] args;
            args = new String[4];
            args[0] = "-src";
            //args[1] = "webapps/amenu/teste.menu";
            args[1] = "/Users/humbertolidioantonelli/NetBeansProjects/ameg/web/teste.menu";
            args[2] = "-targetdir";
            args[3] = "./target";
            
            String retorno = "";
            String text_menu = "";
            String new_file = "target";
            
            File f = new File(args[1]);
 
	  if(!f.exists()){
              this.textErrors.add("File not found!");
              this.textErrors.add(f.getAbsolutePath());
              //retorno = "File not found!";
              return;
	  }else{
              BufferedReader buffRead = new BufferedReader(new FileReader(args[1]));
              String linha = "";
              while (true) {
                  if (linha != null) {
                      text_menu += linha;
                  } else {
                      break;
                  }
                  linha = buffRead.readLine();
              }
              buffRead.close();
              this.textErrors.add(text_menu);
              //System.out.println("File existed");
	  }
          
          /*
            File diretorio = new File("../../"); 
            File[] arquivos = diretorio.listFiles(); 
            
            if(arquivos != null){ 
                int length = arquivos.length; 

                for(int i = 0; i < length; ++i){ 
                    f = arquivos[i]; 

                    if(f.isFile()){ 
                        retorno += f.getName() + "<br >\n"; 
                    } 
                    else if(f.isDirectory()){ 
                        retorno += "Diretorio: " + f.getName() + "<br >\n"; ; 
                    } 
                } 
            } 
         */
            
            
        Generator gen = new Generator();
        gen.runGenerator(text_menu, new_file);
        
        this.textErrors = new ArrayList<>();
        EList<Resource.Diagnostic> errors = gen.getErrors();
        if (errors == null) {
            this.textErrors.add("Code generation finished.");
            //this.textErrors.add(gen.getSourceMenu());
        } else {
            FacesContext context = FacesContext.getCurrentInstance();
            ResourceBundle bundle = context.getApplication().getResourceBundle(context, "homeMsg");
            
            errors.stream().forEach((d) -> {
                this.textErrors.add(bundle.getString("error_line") + d.getLine() + bundle.getString("error_message") + d.getMessage() + " <a href=\"#\" onclick=\"javascript: myCodeMirror.setCursor(" + d.getLine() + "-1, 0); myCodeMirror.focus(); return false;\">" + bundle.getString("goToLine") + "</a>");
            });
        }
    }

}


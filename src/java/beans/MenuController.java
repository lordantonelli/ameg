package beans;


import br.usp.icmc.amenu.AMenuStandaloneSetup;
import com.google.inject.Injector;
import java.io.IOException;
import java.io.Serializable;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.ResourceBundle;
import javax.faces.application.FacesMessage;
import javax.faces.bean.ManagedBean;
import javax.faces.bean.SessionScoped;
import javax.faces.context.FacesContext;
import dsl.*;
import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.FileWriter;
import org.eclipse.emf.common.util.EList;
import org.eclipse.emf.ecore.resource.Resource;

/**
 *
 * @author fgrillo
 */
@ManagedBean
@SessionScoped
public class MenuController implements Serializable
{
    
    
    ArrayList<String> textErrors = null;
    ArrayList<String> textSuccess = null;
    private boolean saveSuccess;
    
    private Long diagramId;
    private String newName = null;
    
    private int selectedItemIndex;
    private String menuAsText;
    private String menuHtml;
    private String menuCss;
    private String menuJs;
    private String file_menu_css;
    
    private Main main;

    /**
     * Creates a new instance of MenuController
     */
    public MenuController() 
    {
        main = new Main();
    }
    
    public String getMenuHtml(){
        return this.menuHtml;
    }
    
    public String getMenuCss(){
        return this.menuCss;
    }
    
    public String getMenuJs(){
        return this.menuJs;
    }
    
    public String getFileMenuCss(){
        return this.file_menu_css;
    }
    
    public void setMenuAsText(String menuAsText) throws Exception {
        this.menuAsText = menuAsText;
    }
    
     public String getMenuAsText() throws FileNotFoundException, IOException {
        if (this.menuAsText == null) {
            
            String arquivo = System.getProperty("user.dir") + "/webapps/ameg/initial.menu";
            File f = new File(arquivo);
          
            this.menuAsText = "";
	  if(f.exists()){
              BufferedReader buffRead = new BufferedReader(new FileReader(arquivo));
              String linha = "";
              while (true) {
                  if (linha != null) {
                      this.menuAsText += linha + "\n";
                  } else {
                      break;
                  }
                  linha = buffRead.readLine();
              }
              buffRead.close();
	  }
        }
        //return System.getProperty("user.dir"); 
        return menuAsText;
    }
    
    public void processForm() throws IOException {
        this.textErrors = new ArrayList<>();
            
            String new_file = "target";
         
            
        //Generator gen = new Generator();
        Injector injector = new AMenuStandaloneSetup().createInjectorAndDoEMFRegistration();
        Generator gen = injector.getInstance(Generator.class);
        gen.runGenerator(this.menuAsText, new_file);
        
        this.textErrors = new ArrayList<>();
        this.textSuccess = new ArrayList<>();
        EList<Resource.Diagnostic> errors = gen.getErrors();
        if (errors == null) {
            this.menuHtml = gen.getCode("html");
            this.menuCss = gen.getCode("css");
            this.menuJs = gen.getCode("js");
            this.setSaveSuccess(true);
            
            File temp = File.createTempFile("temp-file-name", ".css"); 
            //Write to tem file
            try{
                BufferedWriter bufferedReader = new BufferedWriter(new FileWriter(temp));
                //Write to tem file
                bufferedReader.write(this.menuCss);
                bufferedReader.close();
                this.file_menu_css = temp.getCanonicalPath();
            } catch (IOException e) {
                e.printStackTrace();
            }
            
        } else {
            FacesContext context = FacesContext.getCurrentInstance();
            ResourceBundle bundle = context.getApplication().getResourceBundle(context, "homeMsg");
            
            errors.stream().forEach((d) -> {
                this.textErrors.add(bundle.getString("error_line") + d.getLine() + bundle.getString("error_message") + d.getMessage() + " <a href=\"#\" onclick=\"javascript: myCodeMirror.setCursor(" + d.getLine() + "-1, 0); myCodeMirror.focus(); return false;\">" + bundle.getString("goToLine") + "</a>");
            });
        }
    }

    public Long getDiagramId() {
        return diagramId;
    }

    
    public boolean isSaveSuccess() {
        return saveSuccess;
    }

    public void setSaveSuccess(boolean saveSuccess) {
        this.saveSuccess = saveSuccess;
    }

    public String getNewName() {
        return newName;
    }

    public void setNewName(String newName) {
        this.newName = newName;
    }
    
    public ArrayList<String> getTextErrors() {
        return textErrors;
    }

    public void setTextErrors(ArrayList<String> textErrors) {
        this.textErrors = textErrors;
    }
    
    public void resetTextErrors() {
        setTextErrors(null);
    }
    
    public ArrayList<String> getTextSuccess() {
        return textSuccess;
    }

    public void setTextSuccess(ArrayList<String> textErrors) {
        this.textSuccess = textSuccess;
    }
    
    public void resetTextSuccess() {
        setTextSuccess(null);
    }
    
    
    
    private void addMessage(FacesMessage.Severity severity, String message) {
        FacesContext context = FacesContext.getCurrentInstance();
        context.getExternalContext().getFlash().setKeepMessages(true);
        context.addMessage(null, new FacesMessage(severity, message, null));
    }
   
}

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

import java.util.List;

import org.eclipse.emf.common.util.URI;
import org.eclipse.emf.ecore.resource.Resource;
import org.eclipse.emf.ecore.resource.ResourceSet;
import org.eclipse.xtext.generator.JavaIoFileSystemAccess;
import org.eclipse.xtext.validation.IResourceValidator;

import com.google.inject.Inject;
import com.google.inject.Injector;
import com.google.inject.Provider;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import org.eclipse.emf.common.util.EList;
import org.eclipse.emf.ecore.resource.Resource.Diagnostic;
import org.eclipse.xtext.resource.XtextResource;
import org.eclipse.xtext.resource.XtextResourceSet;
import br.usp.icmc.amenu.AMenuStandaloneSetup;
import br.usp.icmc.amenu.generator.AMenuGenerator;

/**
 * This class generates code from a DSL model.
 * @author aphethean
 *
 */
public class Generator {
	
	@Inject
	private Provider<ResourceSet> resourceSetProvider;
	@Inject
	private IResourceValidator validator;
	@Inject
	private AMenuGenerator generator;
	@Inject
	private JavaIoFileSystemAccess fileAccess;
    
    private EList<Diagnostic> warnings;
    private EList<Diagnostic> errors;
    private String code_html;
    private String code_css;
    private String code_js;
    private String code_js_inline;
    
    public String getCode(String type){
        switch (type) {
            case "html":
                return this.code_html;
            case "css":
                return this.code_css;
            case "js":
                return this.code_js;
	    case "js_inline":
                return this.code_js_inline;
            default:
                 return "";
         }
    }
    
    public EList<Diagnostic> getErrors() {
        return errors;
    }
	
    public void runGenerator(String menu, String outputPath) throws IOException {

        // First check if the text is correct using XText
        Injector injector = new AMenuStandaloneSetup().createInjectorAndDoEMFRegistration();
        XtextResourceSet resourceSet = injector.getInstance(XtextResourceSet.class);
        resourceSet.addLoadOption(XtextResource.OPTION_RESOLVE_ALL, Boolean.TRUE);

        Resource resource = resourceSet.createResource(URI.createURI("dummy:/new.menu"));
        InputStream in = new ByteArrayInputStream(menu.getBytes());
        resource.load(in, resourceSet.getLoadOptions());

        EList<Diagnostic> errorList = resource.getErrors();
        this.warnings = resource.getWarnings();

        if (errorList.size() > 0) {
            this.errors = errorList;
            //return null;
        } else {
            //fileAccess.setOutputPath(outputPath);
            //generator.doGenerate(resource, fileAccess);
            try {
                generator.genCode(resource);
                this.code_html = generator.getCode("html");
                this.code_css = generator.getCode("css");
                this.code_js = generator.getCode("js");
		this.code_js_inline = generator.getCode("js_inline");
            } catch (Exception ex) {
                //this.errors.add(ex);
            }
            
        }

    }
}

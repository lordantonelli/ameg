<%@page import="javax.faces.context.FacesContext"%>
<%@page import="dsl.Main"%>
<%@taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@taglib prefix="f" uri="http://java.sun.com/jsf/core"%>
<%@taglib prefix="h" uri="http://java.sun.com/jsf/html"%>

<%
    Main main = new Main();
    main.executar();
%>

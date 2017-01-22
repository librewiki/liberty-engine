/* description: Preproceed templates. */

/* lexical grammar */
%lex
%s intemplate
%s inarg
%%
<inarg>\}\}\} {
  this.popState();
  return 'CLOSE_ARG';
}
<inarg>\| {
  return 'ARG_BAR';
}
\{\{\{ {
  this.begin('inarg');
  return 'OPEN_ARG';
}
<intemplate>\}\} {
  this.popState();
  return 'CLOSE_TEMPLATE';
}
<intemplate>\| {
  return 'TEMPLATE_BAR';
}
\{\{ {
  this.begin('intemplate');
  return 'OPEN_TEMPLATE';
}

<*>.|\n {
  return 'LETTER';
}

$ {
  return 'EOF';
}

/lex



%start doc

%% /* language grammar */

doc
    : items EOF {
        let res = new yy.Nodes.RootNode();
        res.setChildren($1);
        return res;
      }
    | items error EOF {
        let result = new yy.Nodes.RootNode();
        result.setChildren($1);
        return result;
      }
    | EOF {
        return new yy.Nodes.RootNode();
      }
    ;

items
    : item {
        $$ = [$1]
      }
    | items item {
        $$ = $1
        $$.push($2);
      }
    ;
item
    : template
    | arg
    | sentence {
        $$ = new yy.Nodes.TextNode($1);
      }
    ;
arg
    : OPEN_ARG items CLOSE_ARG {
        $$ = new yy.Nodes.ArgumentNode();
        $$.setArgChildren($2);
      }
    | OPEN_ARG items ARG_BAR items CLOSE_ARG {
        $$ = new yy.Nodes.ArgumentNode();
        $$.setArgChildren($2);
        $$.setDefaultChildren($4);
      }
    | OPEN_ARG items ARG_BAR CLOSE_ARG {
        $$ = new yy.Nodes.ArgumentNode();
        $$.setArgChildren($2);
        $$.setDefaultChildren(new yy.Nodes.TextNode(''));
      }
    ;
template
    : template_title template_params CLOSE_TEMPLATE {
        $$ = $1
        $$.setParamChildren($2);
      }
    | template_title CLOSE_TEMPLATE {
        $$ = $1
      }
    ;
template_title
    : OPEN_TEMPLATE items {
        $$ = new yy.Nodes.TemplateNode();
        $$.setTitleChildren($2);
      }
    ;
template_param
    : TEMPLATE_BAR items {
        $$ = new yy.Nodes.TemplateNode.param();
        $$.setChildren($2);
      }
    | TEMPLATE_BAR {
        $$ = new yy.Nodes.TemplateNode.param();
      }
    ;
template_params
    : template_param {
        $$ = [$1];
      }
    | template_params template_param {
        $$ = $1;
        $$.push($2);
      }
    ;
sentence
    : LETTER
    | sentence LETTER {
        $$ = $1 + $2;
      }
    ;

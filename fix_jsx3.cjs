const fs = require('fs');
let code = fs.readFileSync('src/components/PublicProfileSettings.tsx', 'utf8');

code = code.replace("            </div>\n          )}\n        </div>", "            </div>\n          </>)}\n        </div>");

code = code.replace("              </div>\n            </div>\n          )}\n        </div>", "              </div>\n            </div>\n          </>)}\n        </div>");

fs.writeFileSync('src/components/PublicProfileSettings.tsx', code);

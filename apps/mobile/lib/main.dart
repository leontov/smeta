import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:provider/single_child_widget.dart';

import 'src/core/services/estimation_controller.dart';
import 'src/core/services/normative_service.dart';
import 'src/core/services/project_repository.dart';
import 'src/core/services/projects_controller.dart';
import 'src/features/estimation/estimation_screen.dart';
import 'src/features/estimation/project_detail_screen.dart';
import 'src/features/home/home_screen.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  final NormativeService normativeService = NormativeService();
  final ProjectRepository repository = ProjectRepository(normativeService);
  runApp(
    MultiProvider(
      providers: <SingleChildWidget>[
        Provider<NormativeService>.value(value: normativeService),
        Provider<ProjectRepository>.value(value: repository),
        ChangeNotifierProvider<ProjectsController>(
          create: (_) => ProjectsController(repository),
        ),
        ChangeNotifierProvider<EstimationController>(
          create: (_) => EstimationController(normativeService, repository),
        ),
      ],
      child: const SmetaApp(),
    ),
  );
}

class SmetaApp extends StatelessWidget {
  const SmetaApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Смета №1',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.deepPurple),
        useMaterial3: true,
      ),
      initialRoute: HomeScreen.route,
      routes: <String, WidgetBuilder>{
        HomeScreen.route: (_) => const HomeScreen(),
        EstimationScreen.route: (_) => const EstimationScreen(),
      },
      onGenerateRoute: (RouteSettings settings) {
        if (settings.name == ProjectDetailScreen.route && settings.arguments is String) {
          return MaterialPageRoute<void>(
            builder: (_) => ProjectDetailScreen(projectId: settings.arguments! as String),
          );
        }
        return null;
      },
    );
  }
}
